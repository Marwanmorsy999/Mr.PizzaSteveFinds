export interface Env {
  pizzasteve_db: D1Database;
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key",
};

const ADMIN_KEY = "pizzasteve2024";
function isAdmin(r: Request) { return r.headers.get("X-Admin-Key") === ADMIN_KEY; }

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
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    const url = new URL(request.url);

    // Run migration to add sort_order if needed (safe to run every time)
    try {
      await env.pizzasteve_db.prepare(
        "ALTER TABLE products ADD COLUMN sort_order INTEGER DEFAULT 0"
      ).run();
    } catch {}

    // Run auto-migrations for orders, order_items, settings, and newsletter
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

    // GET /api/products/:id  (supports slug OR id)
    const getOne = url.pathname.match(/^\/api\/products\/([^/]+)$/);
    if (getOne && request.method === "GET") {
      const slug = getOne[1];
      // Try exact id first, then slug match
      let r: any = await env.pizzasteve_db
        .prepare("SELECT * FROM products WHERE id = ?")
        .bind(slug)
        .first();
      if (!r) {
        // fallback: slug is derived from name
        r = await env.pizzasteve_db
          .prepare("SELECT * FROM products WHERE lower(replace(replace(name,' ','-'),'/','')) LIKE ?")
          .bind(`%${slug}%`)
          .first();
      }
      if (!r) return new Response("Not found", { status: 404, headers: CORS });
      return new Response(JSON.stringify(mapProduct(r)), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // POST /api/products
    if (url.pathname === "/api/products" && request.method === "POST") {
      if (!isAdmin(request)) return new Response("Unauthorized", { status: 401, headers: CORS });
      const body: any = await request.json();
      const id = body.id || body.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      // Put new items at top (sort_order = 0, shift others)
      await env.pizzasteve_db
        .prepare("UPDATE products SET sort_order = sort_order + 1")
        .run();
      await env.pizzasteve_db
        .prepare(
          "INSERT INTO products (id,name,size,price,price_label,status,emoji,tag,image_url,images,condition,description,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,0)"
        )
        .bind(
          id, body.name, body.size || null, body.price || null,
          body.priceLabel || null, body.status || "available",
          body.emoji || "🍕", body.tag || "ITEM",
          body.imageUrl || null, JSON.stringify(body.images || []),
          body.condition || null, body.description || null
        )
        .run();
      return new Response(JSON.stringify({ success: true, id }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // POST /api/products/bulk
    if (url.pathname === "/api/products/bulk" && request.method === "POST") {
      if (!isAdmin(request)) return new Response("Unauthorized", { status: 401, headers: CORS });
      const items: any[] = await request.json();
      if (!Array.isArray(items) || items.length === 0) {
        return new Response("Invalid payload", { status: 400, headers: CORS });
      }

      // Shift existing products' sort_order down
      await env.pizzasteve_db
        .prepare("UPDATE products SET sort_order = sort_order + ?")
        .bind(items.length)
        .run();

      const stmts = items.map((body, index) => {
        const id = body.id || (body.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Math.floor(1000 + Math.random() * 9000));
        return env.pizzasteve_db.prepare(
          "INSERT INTO products (id,name,size,price,price_label,status,emoji,tag,image_url,images,condition,description,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)"
        ).bind(
          id, body.name, body.size || null, body.price ? parseInt(body.price) : null,
          body.priceLabel || null, body.status || "available",
          body.emoji || "🍕", body.tag || "TEE",
          body.imageUrl || null, JSON.stringify(body.images || []),
          body.condition || "Good", body.description || null,
          index
        );
      });

      await env.pizzasteve_db.batch(stmts);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // PATCH /api/products/:id
    const patchMatch = url.pathname.match(/^\/api\/products\/([^/]+)$/);
    if (patchMatch && request.method === "PATCH") {
      if (!isAdmin(request)) return new Response("Unauthorized", { status: 401, headers: CORS });
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
        .bind(...values)
        .run();
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // DELETE /api/products/:id
    const delMatch = url.pathname.match(/^\/api\/products\/([^/]+)$/);
    if (delMatch && request.method === "DELETE") {
      if (!isAdmin(request)) return new Response("Unauthorized", { status: 401, headers: CORS });
      await env.pizzasteve_db
        .prepare("DELETE FROM products WHERE id=?")
        .bind(delMatch[1])
        .run();
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // POST /api/products/reorder  — body: { order: ["id1","id2",...] }
    if (url.pathname === "/api/products/reorder" && request.method === "POST") {
      if (!isAdmin(request)) return new Response("Unauthorized", { status: 401, headers: CORS });
      const { order }: { order: string[] } = await request.json();
      const stmts = order.map((id, i) =>
        env.pizzasteve_db.prepare("UPDATE products SET sort_order=? WHERE id=?").bind(i, id)
      );
      await env.pizzasteve_db.batch(stmts);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // POST /api/products/bulk-sold  — body: { ids: ["id1","id2",...] }
    if (url.pathname === "/api/products/bulk-sold" && request.method === "POST") {
      if (!isAdmin(request)) return new Response("Unauthorized", { status: 401, headers: CORS });
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
        .prepare("SELECT value FROM settings WHERE key = 'announcement'")
        .first();
      return new Response(JSON.stringify({ text: r?.value || "" }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // POST /api/announcement
    if (url.pathname === "/api/announcement" && request.method === "POST") {
      if (!isAdmin(request)) return new Response("Unauthorized", { status: 401, headers: CORS });
      const body: any = await request.json();
      await env.pizzasteve_db
        .prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('announcement', ?)")
        .bind(body.text || "")
        .run();
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // POST /api/newsletter
    if (url.pathname === "/api/newsletter" && request.method === "POST") {
      const body: any = await request.json();
      if (!body.email) return new Response("Email required", { status: 400, headers: CORS });
      await env.pizzasteve_db
        .prepare("INSERT OR IGNORE INTO newsletter (email) VALUES (?)")
        .bind(body.email)
        .run();
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // GET /api/settings
    if (url.pathname === "/api/settings" && request.method === "GET") {
      try {
        const { results } = await env.pizzasteve_db
          .prepare("SELECT key, value FROM settings")
          .all();
        const settings: Record<string, string> = {};
        for (const r of results as any[]) {
          settings[r.key] = r.value;
        }
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
      if (!isAdmin(request)) return new Response("Unauthorized", { status: 401, headers: CORS });
      const body: any = await request.json();
      await env.pizzasteve_db
        .prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)")
        .bind(body.key, body.value ?? "")
        .run();
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // GET /api/orders (admin only)
    if (url.pathname === "/api/orders" && request.method === "GET") {
      if (!isAdmin(request)) return new Response("Unauthorized", { status: 401, headers: CORS });
      const { results: orders } = await env.pizzasteve_db
        .prepare("SELECT * FROM orders ORDER BY created_at DESC")
        .all();
      const { results: items } = await env.pizzasteve_db
        .prepare("SELECT * FROM order_items")
        .all();
      
      const itemsMap = new Map();
      for (const item of items as any[]) {
        if (!itemsMap.has(item.order_id)) itemsMap.set(item.order_id, []);
        itemsMap.get(item.order_id).push({
          productId: item.product_id,
          name: item.name,
          size: item.size ?? undefined,
          price: item.price ?? undefined,
          priceLabel: item.price_label ?? undefined,
        });
      }

      const fullOrders = orders.map((o: any) => ({
        id: o.id,
        customerName: o.customer_name,
        customerPhone: o.customer_phone,
        address: o.address ?? undefined,
        notes: o.notes ?? undefined,
        pickup: o.pickup === 1,
        total: o.total,
        status: o.status,
        createdAt: o.created_at,
        items: itemsMap.get(o.id) || [],
      }));

      return new Response(JSON.stringify(fullOrders), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // POST /api/orders (public checkout)
    if (url.pathname === "/api/orders" && request.method === "POST") {
      const body: any = await request.json();
      if (!body.customerName || !body.customerPhone || !body.items || body.items.length === 0) {
        return new Response("Invalid order payload", { status: 400, headers: CORS });
      }

      // Check if any items are already sold
      const productIds = body.items.map((i: any) => i.productId);
      const placeholders = productIds.map(() => "?").join(",");
      const { results } = await env.pizzasteve_db
        .prepare(`SELECT id, status FROM products WHERE id IN (${placeholders})`)
        .bind(...productIds)
        .all();
      
      const soldItems = results.filter((r: any) => r.status === "sold");
      if (soldItems.length > 0) {
        return new Response(JSON.stringify({
          success: false,
          error: "Some items are already sold: " + soldItems.map(s => s.id).join(", ")
        }), {
          status: 400,
          headers: { ...CORS, "Content-Type": "application/json" }
        });
      }

      // Generate random order ID
      const orderId = `PS-${Math.floor(100000 + Math.random() * 900000)}`;

      // Build batch statements
      const stmts = [
        env.pizzasteve_db.prepare(
          "INSERT INTO orders (id, customer_name, customer_phone, address, notes, pickup, total) VALUES (?, ?, ?, ?, ?, ?, ?)"
        ).bind(
          orderId,
          body.customerName,
          body.customerPhone,
          body.address || null,
          body.notes || null,
          body.pickup ? 1 : 0,
          body.total || 0
        )
      ];

      for (const item of body.items) {
        stmts.push(
          env.pizzasteve_db.prepare(
            "INSERT INTO order_items (order_id, product_id, name, size, price, price_label) VALUES (?, ?, ?, ?, ?, ?)"
          ).bind(
            orderId,
            item.productId,
            item.name,
            item.size || null,
            item.price || null,
            item.priceLabel || null
          )
        );
        stmts.push(
          env.pizzasteve_db.prepare(
            "UPDATE products SET status = 'sold' WHERE id = ?"
          ).bind(item.productId)
        );
      }

      await env.pizzasteve_db.batch(stmts);

      return new Response(JSON.stringify({ success: true, orderId }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // PATCH /api/orders/:id (admin only)
    const patchOrderMatch = url.pathname.match(/^\/api\/orders\/([^/]+)$/);
    if (patchOrderMatch && request.method === "PATCH") {
      if (!isAdmin(request)) return new Response("Unauthorized", { status: 401, headers: CORS });
      const orderId = patchOrderMatch[1];
      const body: any = await request.json();
      if (!body.status) return new Response("Status required", { status: 400, headers: CORS });

      // If status is changed to cancelled, restore products to 'available'
      if (body.status === "cancelled") {
        const { results: items } = await env.pizzasteve_db
          .prepare("SELECT product_id FROM order_items WHERE order_id = ?")
          .bind(orderId)
          .all();
        const productIds = items.map((i: any) => i.product_id);
        if (productIds.length > 0) {
          const stmts = productIds.map(pid =>
            env.pizzasteve_db.prepare("UPDATE products SET status = 'available' WHERE id = ?").bind(pid)
          );
          await env.pizzasteve_db.batch(stmts);
        }
      } else if (body.status === "completed" || body.status === "pending") {
        // If changed back to completed/pending, make sure they are marked as 'sold'
        const { results: items } = await env.pizzasteve_db
          .prepare("SELECT product_id FROM order_items WHERE order_id = ?")
          .bind(orderId)
          .all();
        const productIds = items.map((i: any) => i.product_id);
        if (productIds.length > 0) {
          const stmts = productIds.map(pid =>
            env.pizzasteve_db.prepare("UPDATE products SET status = 'sold' WHERE id = ?").bind(pid)
          );
          await env.pizzasteve_db.batch(stmts);
        }
      }

      await env.pizzasteve_db
        .prepare("UPDATE orders SET status = ? WHERE id = ?")
        .bind(body.status, orderId)
        .run();

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // DELETE /api/orders/:id (admin only)
    const delOrderMatch = url.pathname.match(/^\/api\/orders\/([^/]+)$/);
    if (delOrderMatch && request.method === "DELETE") {
      if (!isAdmin(request)) return new Response("Unauthorized", { status: 401, headers: CORS });
      const orderId = delOrderMatch[1];
      const stmts = [
        env.pizzasteve_db.prepare("DELETE FROM order_items WHERE order_id = ?").bind(orderId),
        env.pizzasteve_db.prepare("DELETE FROM orders WHERE id = ?").bind(orderId)
      ];
      await env.pizzasteve_db.batch(stmts);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    return new Response("Not found", { status: 404, headers: CORS });
  },
};
