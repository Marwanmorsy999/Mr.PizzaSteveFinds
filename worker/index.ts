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

    return new Response("Not found", { status: 404, headers: CORS });
  },
};
