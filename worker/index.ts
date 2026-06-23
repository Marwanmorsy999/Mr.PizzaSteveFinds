﻿export interface Env {
  pizzasteve_db: D1Database;
  ADMIN_PASSWORD: string;
  SESSION_SECRET: string;
  SESSIONS: KVNamespace;
  RATE_LIMIT: KVNamespace;
  RESEND_API_KEY?: string;
}

import { Resend } from "resend";

let resendClient: any = null;
function getResend(env: Env) {
  if (!resendClient && env.RESEND_API_KEY) {
    resendClient = new Resend(env.RESEND_API_KEY);
  }
  return resendClient;
}

const getAllowedOrigin = (env: Env) =>
  (env as any).CORS_ORIGIN || "https://mr-pizzasteve-finds.m-2396.workers.dev";

function getCORS(env: Env) {
  return {
    "Access-Control-Allow-Origin": getAllowedOrigin(env),
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key, X-Admin-Token",
    "Access-Control-Allow-Credentials": "true",
  };
}

async function isAdmin(r: Request, env: Env): Promise<boolean> {
  const adminPass = env.ADMIN_PASSWORD;
  if (!adminPass) return false;

  // Legacy key support
  const key = r.headers.get("X-Admin-Key");
  if (key === adminPass) return true;

  // Session token
  const token = r.headers.get("X-Admin-Token");
  if (token) {
    try {
      const session = await env.SESSIONS.get(`session:${token}`);
      return session === "valid";
    } catch { return false; }
  }
  return false;
}

async function checkRateLimit(ip: string, env: Env): Promise<boolean> {
  try {
    const key = `rl:login:${ip}`;
    const raw = await env.RATE_LIMIT.get(key);
    const count = raw ? parseInt(raw) : 0;
    if (count >= 5) return false;
    await env.RATE_LIMIT.put(key, String(count + 1), { expirationTtl: 60 });
    return true;
  } catch { return true; } // fail open if KV unavailable
}

function mapProduct(r: any) {
  return {
    id: r.id,
    name: r.name,
    size: r.size ?? undefined,
    price: r.price ?? undefined,
    priceLabel: r.price_label ?? undefined,
    status: r.status,
    emoji: r.emoji,
    tag: r.tag,
    imageUrl: r.image_url ?? undefined,
    images: r.images ? JSON.parse(r.images) : [],
    condition: r.condition ?? undefined,
    description: r.description ?? undefined,
    sortOrder: r.sort_order ?? 0,
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const CORS = getCORS(env);

    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    const url = new URL(request.url);

    try {

    // POST /api/login
    if (url.pathname === "/api/login" && request.method === "POST") {
      const ip = request.headers.get("CF-Connecting-IP") || "unknown";
      const allowed = await checkRateLimit(ip, env);
      if (!allowed) {
        return new Response(JSON.stringify({ error: "Too many attempts. Try again in 1 minute." }), {
          status: 429, headers: { ...CORS, "Content-Type": "application/json" }
        });
      }
      const body: any = await request.json();
      const adminPass = env.ADMIN_PASSWORD;
      if (!adminPass || body.password !== adminPass) {
        return new Response(JSON.stringify({ error: "Wrong password" }), {
          status: 401, headers: { ...CORS, "Content-Type": "application/json" }
        });
      }
      // Generate a random session token
      const token = crypto.randomUUID();
      await env.SESSIONS.put(`session:${token}`, "valid", { expirationTtl: 90 * 24 * 60 * 60 });
      return new Response(JSON.stringify({ token }), {
        headers: { ...CORS, "Content-Type": "application/json" }
      });
    }

    // POST /api/session/check
    if (url.pathname === "/api/session/check" && request.method === "POST") {
      const valid = await isAdmin(request, env);
      if (!valid) {
        return new Response(JSON.stringify({ error: "Invalid session" }), {
          status: 401, headers: { ...CORS, "Content-Type": "application/json" }
        });
      }
      // Refresh token — generate new one, store old mapping briefly
      const oldToken = request.headers.get("X-Admin-Token");
      const newToken = crypto.randomUUID();
      await env.SESSIONS.put(`session:${newToken}`, "valid", { expirationTtl: 90 * 24 * 60 * 60 });
      // Keep old token valid for 5 more minutes to avoid race conditions
      if (oldToken) {
        await env.SESSIONS.put(`session:${oldToken}`, "valid", { expirationTtl: 300 });
      }
      return new Response(JSON.stringify({ token: newToken, ok: true }), {
        headers: { ...CORS, "Content-Type": "application/json" }
      });
    }

    // Run migration to add sort_order if needed
    try {
      await env.pizzasteve_db.prepare(
        "ALTER TABLE products ADD COLUMN sort_order INTEGER DEFAULT 0"
      ).run();
    } catch {}

    // Auto-migrations
    try {
      await env.pizzasteve_db.prepare(`
        CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          customer_name TEXT NOT NULL,
          customer_phone TEXT NOT NULL,
          address TEXT,
          notes TEXT,
          pickup INTEGER DEFAULT 1,
          total INTEGER DEFAULT 0,
          status TEXT DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run();
    } catch {}

    try {
      await env.pizzasteve_db.prepare(`
        CREATE TABLE IF NOT EXISTS order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id TEXT NOT NULL,
          product_id TEXT NOT NULL,
          name TEXT NOT NULL,
          size TEXT,
          price INTEGER,
          price_label TEXT,
          FOREIGN KEY (order_id) REFERENCES orders(id)
        )
      `).run();
    } catch {}

    try {
      await env.pizzasteve_db.prepare(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT
        )
      `).run();
    } catch {}

    try {
      await env.pizzasteve_db.prepare(`
        CREATE TABLE IF NOT EXISTS newsletter (
          email TEXT PRIMARY KEY,
          subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run();
    } catch {}

    // GET /api/products
    if (url.pathname === "/api/products" && request.method === "GET") {
      const { results } = await env.pizzasteve_db
        .prepare("SELECT * FROM products ORDER BY sort_order ASC, rowid ASC")
        .all();
      return new Response(JSON.stringify(results.map(mapProduct)), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // GET /api/products/:id
    const getOne = url.pathname.match(/^\/api\/products\/([^/]+)$/);
    if (getOne && request.method === "GET") {
      const slug = getOne[1];
      let r: any = await env.pizzasteve_db
        .prepare("SELECT * FROM products WHERE id = ?")
        .bind(slug).first();
      if (!r) {
        r = await env.pizzasteve_db
          .prepare("SELECT * FROM products WHERE lower(replace(replace(name,' ','-'),'/','')) LIKE ?")
          .bind(`%${slug}%`).first();
      }
      if (!r) return new Response("Not found", { status: 404, headers: CORS });
      return new Response(JSON.stringify(mapProduct(r)), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // POST /api/products
    if (url.pathname === "/api/products" && request.method === "POST") {
      if (!await isAdmin(request, env)) return new Response("Unauthorized", { status: 401, headers: CORS });
      const body: any = await request.json();
      const id = body.id || body.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      await env.pizzasteve_db.prepare("UPDATE products SET sort_order = sort_order + 1").run();
      await env.pizzasteve_db
        .prepare("INSERT INTO products (id,name,size,price,price_label,status,emoji,tag,image_url,images,condition,description,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,0)")
        .bind(id, body.name, body.size || null, body.price || null, body.priceLabel || null,
          body.status || "available", body.emoji || "🍕", body.tag || "ITEM",
          body.imageUrl || null, JSON.stringify(body.images || []),
          body.condition || null, body.description || null)
        .run();
      return new Response(JSON.stringify({ success: true, id }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // POST /api/products/bulk
    if (url.pathname === "/api/products/bulk" && request.method === "POST") {
      if (!await isAdmin(request, env)) return new Response("Unauthorized", { status: 401, headers: CORS });
      const items: any[] = await request.json();
      if (!Array.isArray(items) || items.length === 0)
        return new Response("Invalid payload", { status: 400, headers: CORS });

      // Validate every item has a usable name BEFORE touching the DB.
      // This is what was crashing the whole request before (body.name.toLowerCase()
      // on an undefined/blank name), which Cloudflare turned into a bare 500
      // with no CORS headers — looking like a CORS error in the browser.
      const badIndex = items.findIndex(b => !b.name || typeof b.name !== "string" || !b.name.trim());
      if (badIndex !== -1) {
        return new Response(JSON.stringify({
          error: `Item at index ${badIndex} is missing a name`,
        }), { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });
      }

      await env.pizzasteve_db.prepare("UPDATE products SET sort_order = sort_order + ?").bind(items.length).run();
      const stmts = items.map((body, index) => {
        const id = body.id || (body.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Math.floor(1000 + Math.random() * 9000));
        return env.pizzasteve_db.prepare(
          "INSERT INTO products (id,name,size,price,price_label,status,emoji,tag,image_url,images,condition,description,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)"
        ).bind(id, body.name, body.size || null, body.price ? parseInt(body.price) : null,
          body.priceLabel || null, body.status || "available", body.emoji || "🍕", body.tag || "TEE",
          body.imageUrl || null, JSON.stringify(body.images || []),
          body.condition || "Good", body.description || null, index);
      });
      await env.pizzasteve_db.batch(stmts);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // PATCH /api/products/:id
    const patchMatch = url.pathname.match(/^\/api\/products\/([^/]+)$/);
    if (patchMatch && request.method === "PATCH") {
      if (!await isAdmin(request, env)) return new Response("Unauthorized", { status: 401, headers: CORS });
      const body: any = await request.json();
      const fields: string[] = [];
      const values: any[] = [];
      if (body.name !== undefined)        { fields.push("name=?");        values.push(body.name); }
      if (body.price !== undefined)       { fields.push("price=?");       values.push(body.price); }
      if (body.priceLabel !== undefined)  { fields.push("price_label=?"); values.push(body.priceLabel); }
      if (body.status !== undefined)      { fields.push("status=?");      values.push(body.status); }
      if (body.imageUrl !== undefined)    { fields.push("image_url=?");   values.push(body.imageUrl); }
      if (body.images !== undefined)      { fields.push("images=?");      values.push(JSON.stringify(body.images)); }
      if (body.condition !== undefined)   { fields.push("condition=?");   values.push(body.condition); }
      if (body.description !== undefined) { fields.push("description=?"); values.push(body.description); }
      if (body.sort_order !== undefined)  { fields.push("sort_order=?");  values.push(body.sort_order); }
      if (!fields.length) return new Response("Nothing to update", { status: 400, headers: CORS });
      values.push(patchMatch[1]);
      await env.pizzasteve_db
        .prepare(`UPDATE products SET ${fields.join(",")} WHERE id=?`)
        .bind(...values).run();
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // DELETE /api/products/:id
    const delMatch = url.pathname.match(/^\/api\/products\/([^/]+)$/);
    if (delMatch && request.method === "DELETE") {
      if (!await isAdmin(request, env)) return new Response("Unauthorized", { status: 401, headers: CORS });
      await env.pizzasteve_db.prepare("DELETE FROM products WHERE id=?").bind(delMatch[1]).run();
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // POST /api/products/reorder
    if (url.pathname === "/api/products/reorder" && request.method === "POST") {
      if (!await isAdmin(request, env)) return new Response("Unauthorized", { status: 401, headers: CORS });
      const { order }: { order: string[] } = await request.json();
      const stmts = order.map((id, i) =>
        env.pizzasteve_db.prepare("UPDATE products SET sort_order=? WHERE id=?").bind(i, id)
      );
      await env.pizzasteve_db.batch(stmts);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // POST /api/products/bulk-sold
    if (url.pathname === "/api/products/bulk-sold" && request.method === "POST") {
      if (!await isAdmin(request, env)) return new Response("Unauthorized", { status: 401, headers: CORS });
      const { ids }: { ids: string[] } = await request.json();
      const stmts = ids.map(id =>
        env.pizzasteve_db.prepare("UPDATE products SET status='sold' WHERE id=?").bind(id)
      );
      await env.pizzasteve_db.batch(stmts);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // GET /api/announcement
    if (url.pathname === "/api/announcement" && request.method === "GET") {
      const r: any = await env.pizzasteve_db
        .prepare("SELECT value FROM settings WHERE key = 'announcement'").first();
      return new Response(JSON.stringify({ text: r?.value || "" }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // POST /api/announcement
    if (url.pathname === "/api/announcement" && request.method === "POST") {
      if (!await isAdmin(request, env)) return new Response("Unauthorized", { status: 401, headers: CORS });
      const body: any = await request.json();
      await env.pizzasteve_db
        .prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('announcement', ?)")
        .bind(body.text || "").run();
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // POST /api/newsletter
    if (url.pathname === "/api/newsletter" && request.method === "POST") {
      const body: any = await request.json();
      if (!body.email) return new Response("Email required", { status: 400, headers: CORS });
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) return new Response("Invalid email", { status: 400, headers: CORS });
      await env.pizzasteve_db
        .prepare("INSERT OR IGNORE INTO newsletter (email) VALUES (?)").bind(body.email).run();
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // GET /api/settings
    if (url.pathname === "/api/settings" && request.method === "GET") {
      try {
        const { results } = await env.pizzasteve_db.prepare("SELECT key, value FROM settings").all();
        const settings: Record<string, string> = {};
        for (const r of results as any[]) settings[r.key] = r.value;
        return new Response(JSON.stringify(settings), {
          headers: { ...CORS, "Content-Type": "application/json" },
        });
      } catch {
        return new Response(JSON.stringify({}), {
          headers: { ...CORS, "Content-Type": "application/json" },
        });
      }
    }

    // POST /api/settings
    if (url.pathname === "/api/settings" && request.method === "POST") {
      if (!await isAdmin(request, env)) return new Response("Unauthorized", { status: 401, headers: CORS });
      const body: any = await request.json();
      await env.pizzasteve_db
        .prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").bind(body.key, body.value ?? "").run();
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // GET /api/orders
    if (url.pathname === "/api/orders" && request.method === "GET") {
      if (!await isAdmin(request, env)) return new Response("Unauthorized", { status: 401, headers: CORS });
      const { results: orders } = await env.pizzasteve_db
        .prepare("SELECT * FROM orders ORDER BY created_at DESC").all();
      const { results: items } = await env.pizzasteve_db.prepare("SELECT * FROM order_items").all();
      const itemsMap = new Map();
      for (const item of items as any[]) {
        if (!itemsMap.has(item.order_id)) itemsMap.set(item.order_id, []);
        itemsMap.get(item.order_id).push({
          productId: item.product_id, name: item.name,
          size: item.size ?? undefined, price: item.price ?? undefined,
          priceLabel: item.price_label ?? undefined,
        });
      }
      const fullOrders = orders.map((o: any) => ({
        id: o.id, customerName: o.customer_name, customerPhone: o.customer_phone,
        address: o.address ?? undefined, notes: o.notes ?? undefined,
        pickup: o.pickup === 1, total: o.total, status: o.status,
        createdAt: o.created_at, items: itemsMap.get(o.id) || [],
      }));
      return new Response(JSON.stringify(fullOrders), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // POST /api/orders
    if (url.pathname === "/api/orders" && request.method === "POST") {
      const body: any = await request.json();
      if (!body.customerName || !body.customerPhone || !body.items || body.items.length === 0)
        return new Response("Invalid order payload", { status: 400, headers: CORS });

      // Build status-flip statements for each item
      const flipStmts = body.items.map((item: any) =>
        env.pizzasteve_db.prepare("UPDATE products SET status = 'sold' WHERE id = ? AND status = 'available'").bind(item.productId)
      );

      // Execute status flips in a batch
      const flipResults = await env.pizzasteve_db.batch(flipStmts);

      const failedIds: string[] = [];
      const successfulIds: string[] = [];

      for (let i = 0; i < flipResults.length; i++) {
        if (flipResults[i].meta.changes === 0) {
          failedIds.push(body.items[i].productId);
        } else {
          successfulIds.push(body.items[i].productId);
        }
      }

      // If any item failed to flip (sold out or not found), roll back the successful ones and fail
      if (failedIds.length > 0) {
        if (successfulIds.length > 0) {
          const rollbackStmts = successfulIds.map(id =>
            env.pizzasteve_db.prepare("UPDATE products SET status = 'available' WHERE id = ?").bind(id)
          );
          await env.pizzasteve_db.batch(rollbackStmts);
        }
        return new Response(JSON.stringify({
          success: false,
          error: "sold_out",
          soldOutIds: failedIds
        }), { status: 409, headers: { ...CORS, "Content-Type": "application/json" } });
      }

      // All items were successfully marked as sold. Now insert the order and order items.
      const orderId = `PS-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      const insertStmts = [
        env.pizzasteve_db.prepare(
          "INSERT INTO orders (id, customer_name, customer_phone, address, notes, pickup, total) VALUES (?, ?, ?, ?, ?, ?, ?)"
        ).bind(orderId, body.customerName, body.customerPhone, body.address || null,
          body.notes || null, body.pickup ? 1 : 0, body.total || 0)
      ];
      for (const item of body.items) {
        insertStmts.push(env.pizzasteve_db.prepare(
          "INSERT INTO order_items (order_id, product_id, name, size, price, price_label) VALUES (?, ?, ?, ?, ?, ?)"
        ).bind(orderId, item.productId, item.name, item.size || null, item.price || null, item.priceLabel || null));
      }

      await env.pizzasteve_db.batch(insertStmts);

      try {
        const r = getResend(env);
        if (r) {
          const itemsHtml = (body.items as any[]).map((it: any) => `
            <tr>
              <td style="padding:8px;border-bottom:1px solid #333">${it.name}</td>
              <td style="padding:8px;border-bottom:1px solid #333">${it.size || '-'}</td>
              <td style="padding:8px;border-bottom:1px solid #333">${it.price ?? it.priceLabel ?? '-'}</td>
            </tr>
          `).join('');
          await (r as any).emails.send({
            from: 'Mr. Pizza Steve Finds <orders@pizzastevefinds.com>',
            to: ['ifarouk448@gmail.com'],
            subject: `New order ${orderId}`,
            html: `
              <div style="background:#0a0a0a;color:#fff;font-family:sans-serif;padding:24px">
                <h2 style="color:#f97316">New order ${orderId}</h2>
                <p><strong>Customer:</strong> ${body.customerName} (${body.customerPhone})</p>
                ${body.address ? `<p><strong>Address:</strong> ${body.address}</p>` : ''}
                ${body.notes ? `<p><strong>Notes:</strong> ${body.notes}</p>` : ''}
                <p><strong>Pickup:</strong> ${body.pickup ? 'Yes' : 'No'}</p>
                <p><strong>Total:</strong> ${body.total} EGP</p>
                <table style="width:100%;border-collapse:collapse;margin-top:16px">
                  <thead>
                    <tr style="background:#161616">
                      <th style="padding:8px;text-align:left">Item</th>
                      <th style="padding:8px;text-align:left">Size</th>
                      <th style="padding:8px;text-align:left">Price</th>
                    </tr>
                  </thead>
                  <tbody>${itemsHtml}</tbody>
                </table>
              </div>
            `,
          });
        }
      } catch (e) {
        console.error('Resend error:', e);
      }

      return new Response(JSON.stringify({ success: true, orderId }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // PATCH /api/orders/:id
    const patchOrderMatch = url.pathname.match(/^\/api\/orders\/([^/]+)$/);
    if (patchOrderMatch && request.method === "PATCH") {
      if (!await isAdmin(request, env)) return new Response("Unauthorized", { status: 401, headers: CORS });
      const orderId = patchOrderMatch[1];
      const body: any = await request.json();
      if (!body.status) return new Response("Status required", { status: 400, headers: CORS });
      if (body.status === "cancelled") {
        const { results: items } = await env.pizzasteve_db
          .prepare("SELECT product_id FROM order_items WHERE order_id = ?").bind(orderId).all();
        const productIds = items.map((i: any) => i.product_id);
        if (productIds.length > 0)
          await env.pizzasteve_db.batch(productIds.map(pid =>
            env.pizzasteve_db.prepare("UPDATE products SET status = 'available' WHERE id = ?").bind(pid)));
      } else if (body.status === "completed" || body.status === "pending") {
        const { results: items } = await env.pizzasteve_db
          .prepare("SELECT product_id FROM order_items WHERE order_id = ?").bind(orderId).all();
        const productIds = items.map((i: any) => i.product_id);
        if (productIds.length > 0)
          await env.pizzasteve_db.batch(productIds.map(pid =>
            env.pizzasteve_db.prepare("UPDATE products SET status = 'sold' WHERE id = ?").bind(pid)));
      }
      await env.pizzasteve_db.prepare("UPDATE orders SET status = ? WHERE id = ?").bind(body.status, orderId).run();
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // DELETE /api/orders/:id
    const delOrderMatch = url.pathname.match(/^\/api\/orders\/([^/]+)$/);
    if (delOrderMatch && request.method === "DELETE") {
      if (!await isAdmin(request, env)) return new Response("Unauthorized", { status: 401, headers: CORS });
      const orderId = delOrderMatch[1];
      await env.pizzasteve_db.batch([
        env.pizzasteve_db.prepare("DELETE FROM order_items WHERE order_id = ?").bind(orderId),
        env.pizzasteve_db.prepare("DELETE FROM orders WHERE id = ?").bind(orderId)
      ]);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    return new Response("Not found", { status: 404, headers: CORS });

    } catch (err: any) {
      console.error("Unhandled error:", err);
      return new Response(JSON.stringify({ error: err?.message || "Internal error" }), {
        status: 500,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }
  },
};