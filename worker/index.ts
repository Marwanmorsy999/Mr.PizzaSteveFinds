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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    const url = new URL(request.url);

    // GET /api/products
    if (url.pathname === "/api/products" && request.method === "GET") {
      const { results } = await env.pizzasteve_db.prepare("SELECT * FROM products ORDER BY status ASC, rowid ASC").all();
      return new Response(JSON.stringify(results.map((r: any) => ({
        id: r.id, name: r.name, size: r.size ?? undefined, price: r.price ?? undefined,
        priceLabel: r.price_label ?? undefined, status: r.status, emoji: r.emoji, tag: r.tag,
        imageUrl: r.image_url ?? undefined, images: r.images ? JSON.parse(r.images) : [],
        condition: r.condition ?? undefined, description: r.description ?? undefined,
      }))), { headers: { ...CORS, "Content-Type": "application/json" } });
    }

    // GET /api/products/:id
    const getOne = url.pathname.match(/^\/api\/products\/([^/]+)$/);
    if (getOne && request.method === "GET") {
      const r: any = await env.pizzasteve_db.prepare("SELECT * FROM products WHERE id = ?").bind(getOne[1]).first();
      if (!r) return new Response("Not found", { status: 404, headers: CORS });
      return new Response(JSON.stringify({
        id: r.id, name: r.name, size: r.size, price: r.price, priceLabel: r.price_label,
        status: r.status, emoji: r.emoji, tag: r.tag, imageUrl: r.image_url,
        images: r.images ? JSON.parse(r.images) : [], condition: r.condition, description: r.description,
      }), { headers: { ...CORS, "Content-Type": "application/json" } });
    }

    // POST /api/products
    if (url.pathname === "/api/products" && request.method === "POST") {
      if (!isAdmin(request)) return new Response("Unauthorized", { status: 401, headers: CORS });
      const body: any = await request.json();
      const id = body.id || body.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      await env.pizzasteve_db.prepare(
        "INSERT INTO products (id,name,size,price,price_label,status,emoji,tag,image_url,images,condition,description) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)"
      ).bind(id, body.name, body.size||null, body.price||null, body.priceLabel||null, body.status||"available",
        body.emoji||"👕", body.tag||"ITEM", body.imageUrl||null, JSON.stringify(body.images||[]),
        body.condition||null, body.description||null).run();
      return new Response(JSON.stringify({ success: true, id }), { headers: { ...CORS, "Content-Type": "application/json" } });
    }

    // PATCH /api/products/:id
    const patchMatch = url.pathname.match(/^\/api\/products\/([^/]+)$/);
    if (patchMatch && request.method === "PATCH") {
      if (!isAdmin(request)) return new Response("Unauthorized", { status: 401, headers: CORS });
      const body: any = await request.json();
      const fields: string[] = []; const values: any[] = [];
      if (body.price !== undefined) { fields.push("price=?"); values.push(body.price); }
      if (body.priceLabel !== undefined) { fields.push("price_label=?"); values.push(body.priceLabel); }
      if (body.status !== undefined) { fields.push("status=?"); values.push(body.status); }
      if (body.imageUrl !== undefined) { fields.push("image_url=?"); values.push(body.imageUrl); }
      if (body.images !== undefined) { fields.push("images=?"); values.push(JSON.stringify(body.images)); }
      if (body.condition !== undefined) { fields.push("condition=?"); values.push(body.condition); }
      if (body.description !== undefined) { fields.push("description=?"); values.push(body.description); }
      if (!fields.length) return new Response("Nothing to update", { status: 400, headers: CORS });
      values.push(patchMatch[1]);
      await env.pizzasteve_db.prepare(`UPDATE products SET ${fields.join(",")} WHERE id=?`).bind(...values).run();
      return new Response(JSON.stringify({ success: true }), { headers: { ...CORS, "Content-Type": "application/json" } });
    }

    // DELETE /api/products/:id
    const delMatch = url.pathname.match(/^\/api\/products\/([^/]+)$/);
    if (delMatch && request.method === "DELETE") {
      if (!isAdmin(request)) return new Response("Unauthorized", { status: 401, headers: CORS });
      await env.pizzasteve_db.prepare("DELETE FROM products WHERE id=?").bind(delMatch[1]).run();
      return new Response(JSON.stringify({ success: true }), { headers: { ...CORS, "Content-Type": "application/json" } });
    }

    // POST /api/newsletter
    if (url.pathname === "/api/newsletter" && request.method === "POST") {
      const body: any = await request.json();
      if (!body.email) return new Response("Email required", { status: 400, headers: CORS });
      await env.pizzasteve_db.prepare("INSERT OR IGNORE INTO newsletter (email) VALUES (?)").bind(body.email).run();
      return new Response(JSON.stringify({ success: true }), { headers: { ...CORS, "Content-Type": "application/json" } });
    }

    return new Response("Not found", { status: 404, headers: CORS });
  },
};
