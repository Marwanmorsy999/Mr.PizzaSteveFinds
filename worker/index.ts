export interface Env {
  pizzasteve_db: D1Database;
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS });
    }

    const url = new URL(request.url);

    if (url.pathname === "/api/products") {
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

      return new Response(JSON.stringify(products), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    return new Response("Not found", { status: 404, headers: CORS });
  },
};