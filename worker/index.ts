export interface Env {
  pizzasteve_db: D1Database;
  ADMIN_SECRET?: string;
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-admin-secret",
};

const ADMIN_SECRET = "pizzasteve2024";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

function isAdmin(request: Request) {
  return request.headers.get("x-admin-secret") === ADMIN_SECRET;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // GET /api/products
    if (path === "/api/products" && request.method === "GET") {
      const { results } = await env.pizzasteve_db
        .prepare("SELECT * FROM products ORDER BY status ASC, rowid ASC")
        .all();
      const products = results.map((r: any) => ({
        id: r.id,
        name: r.name,
        size: r.size ?? undefined,
        price: r.price ?? undefined,
        priceLabel: r.price_label ?? undefined,
        status: r.status,
        emoji: r.emoji,
        tag: r.tag,
      }));
      return json(products);
    }

    // POST /api/products
    if (path === "/api/products" && request.method === "POST") {
      if (!isAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const body: any = await request.json();
      const { id, name, size, price, price_label, status, emoji, tag } = body;
      await env.pizzasteve_db
        .prepare("INSERT INTO products VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(id, name, size ?? null, price ?? null, price_label ?? null, status ?? "available", emoji ?? "👕", tag ?? "ITEM")
        .run();
      return json({ success: true });
    }

    // PATCH /api/products/:id
    const patchMatch = path.match(/^\/api\/products\/(.+)$/);
    if (patchMatch && request.method === "PATCH") {
      if (!isAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const id = patchMatch[1];
      const body: any = await request.json();
      const fields = [];
      const values = [];
      if (body.price !== undefined) { fields.push("price = ?"); values.push(body.price); }
      if (body.price_label !== undefined) { fields.push("price_label = ?"); values.push(body.price_label); }
      if (body.status !== undefined) { fields.push("status = ?"); values.push(body.status); }
      if (body.name !== undefined) { fields.push("name = ?"); values.push(body.name); }
      if (body.size !== undefined) { fields.push("size = ?"); values.push(body.size); }
      if (fields.length === 0) return json({ error: "No fields to update" }, 400);
      values.push(id);
      await env.pizzasteve_db
        .prepare(`UPDATE products SET ${fields.join(", ")} WHERE id = ?`)
        .bind(...values)
        .run();
      return json({ success: true });
    }

    // DELETE /api/products/:id
    const deleteMatch = path.match(/^\/api\/products\/(.+)$/);
    if (deleteMatch && request.method === "DELETE") {
      if (!isAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const id = deleteMatch[1];
      await env.pizzasteve_db
        .prepare("DELETE FROM products WHERE id = ?")
        .bind(id)
        .run();
      return json({ success: true });
    }

    return new Response("Not found", { status: 404, headers: CORS });
  },
};
