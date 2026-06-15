import { useEffect, useState } from "react";
import { Instagram } from "lucide-react";

// Add Instagram post URLs here as new drops happen.
// Get the URL by opening any post on instagram.com and copying the address.
const POST_URLS: string[] = [
  "https://www.instagram.com/mr.pizzastevefinds/",
];

const PROFILE_URL = "https://instagram.com/mr.pizzastevefinds";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

export function InstagramFeed() {
  const [embedFailed, setEmbedFailed] = useState(false);

  useEffect(() => {
    const SRC = "https://www.instagram.com/embed.js";
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SRC}"]`
    );

    if (!existing) {
      const s = document.createElement("script");
      s.src = SRC;
      s.async = true;
      s.onload = () => window.instgrm?.Embeds.process();
      document.body.appendChild(s);
    } else {
      window.instgrm?.Embeds.process();
    }

    // Fallback: if the embed script hasn't loaded after 8 seconds, show a message
    const timeout = setTimeout(() => {
      if (!window.instgrm) {
        setEmbedFailed(true);
      }
    }, 8000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <section className="mx-auto max-w-6xl border-t border-border px-4 py-16">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
            Live from the gram
          </div>
          <h2 className="mt-2 font-display text-3xl uppercase sm:text-5xl">
            @mr.pizzastevefinds
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Primary CTA — visible on all screen sizes */}
          <a
            href={PROFILE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 font-display text-xs uppercase tracking-widest text-primary-foreground transition hover:bg-secondary"
          >
            <Instagram className="size-4" />
            Follow on Instagram
          </a>

          {/* Secondary outline link — desktop only */}
          <a
            href={PROFILE_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-sm border border-primary px-4 py-2 font-display text-xs uppercase tracking-widest text-primary transition hover:bg-primary hover:text-primary-foreground sm:inline-block"
          >
            Open Instagram →
          </a>
        </div>
      </div>

      {/* Embed grid */}
      <div className="mt-8">
        {embedFailed ? (
          /* Fallback card */
          <div className="flex flex-col items-center gap-4 rounded-sm border border-border bg-card px-6 py-12 text-center">
            <Instagram className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Couldn't load Instagram feed right now.
            </p>
            <a
              href={PROFILE_URL}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-primary underline underline-offset-4 transition hover:text-secondary"
            >
              Visit @mr.pizzastevefinds on Instagram →
            </a>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {POST_URLS.map((url) => (
              <blockquote
                key={url}
                className="instagram-media !m-0 !min-w-0 !w-full !max-w-full"
                data-instgrm-permalink={url}
                data-instgrm-version="14"
                style={{ background: "#000", border: 0 }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
