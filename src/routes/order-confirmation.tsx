import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";

const searchSchema = z.object({
  orderId: z.string(),
  waLink: z.string(),
});

export const Route = createFileRoute("/order-confirmation")({
  validateSearch: searchSchema,
  component: OrderConfirmationPage,
});

function OrderConfirmationPage() {
  const { orderId, waLink } = Route.useSearch();

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-16 flex flex-col items-center justify-center">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Animated Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-zinc-800/10 border border-zinc-200/30 rounded-full flex items-center justify-center text-4xl animate-bounce">
            🍕
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-widest text-white">LET'S GOOO 🎉</h1>
          <p className="text-zinc-400 text-sm">reservation placed, ur order ID is <span className="font-mono text-zinc-100 font-bold">{orderId}</span></p>
          <p className="text-zinc-600 text-xs">screenshot this or smth, just in case</p>
        </div>

        {/* Warning / Call to Action Box */}
        <div className="bg-zinc-900 border border-zinc-200/30 rounded-2xl p-6 text-left space-y-4 shadow-lg shadow-orange-500/5">
          <h2 className="text-zinc-100 font-bold text-sm tracking-wider uppercase text-center">⚠️ one last thing tho!</h2>
          <p className="text-zinc-300 text-sm text-center leading-relaxed">
            hit the button below to send ur reservation to Steve on WhatsApp. ur items are held but Steve needs to confirm the details — don't ghost him pls 😭
          </p>
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl tracking-widest text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
          >
            💬 CONFIRM ON WHATSAPP (do it)
          </a>
        </div>

        {/* Secondary Info */}
        <div className="space-y-4 pt-4">
          <p className="text-zinc-500 text-xs leading-relaxed">
            if WhatsApp doesn't open, copy ur order ID <span className="font-mono text-zinc-100/80 font-bold select-all">{orderId}</span> and dm it to Steve on instagram <a href="https://ig.me/m/mr.pizzastevefinds" target="_blank" rel="noreferrer" className="text-zinc-100 hover:underline">@mr.pizzastevefinds</a>. he won't leave u on read, promise.
          </p>
          <div className="pt-2">
            <Link
              to="/shop"
              className="inline-block text-sm text-zinc-400 hover:text-zinc-100 font-bold tracking-widest transition-colors"
            >
              ← back to shop (there's more good stuff)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
