"use client";

import { useEffect } from "react";

// global-error replaces the root layout entirely when the layout itself
// throws, so it must render its own <html>/<body>. It can't assume the app's
// fonts or token classes are applied, so the fallback is deliberately
// self-contained with inline styles.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.75rem",
          padding: "4rem 1.5rem",
          textAlign: "center",
          backgroundColor: "#0a0a0c",
          color: "#ededf0",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, margin: 0 }}>Something went wrong</h1>
        <p style={{ maxWidth: "24rem", fontSize: "0.875rem", color: "#8e8e99", margin: 0 }}>
          MyMDB hit an unexpected error. Reload the page to try again.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: "0.5rem",
            borderRadius: "0.5rem",
            border: "none",
            backgroundColor: "#2e8fff",
            color: "#071019",
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
