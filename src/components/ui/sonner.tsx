"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

// Dark-only app, and there is no ThemeProvider mounted anywhere, so theme is
// hardcoded rather than read from next-themes' useTheme() (which would return
// undefined -> "system" and make toasts follow the OS preference).
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      duration={4000}
      closeButton
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      // These MUST map to this project's real tokens (defined in globals.css
      // :root), not shadcn's stock --popover / --border names. Those bare
      // variables don't exist here — @theme inline only creates the prefixed
      // --color-* Tailwind keys — so the defaults resolve to nothing and every
      // toast renders transparent and invisible against the near-black bg.
      // A future `npx shadcn add` will overwrite this file and silently
      // reintroduce that bug; re-apply these mappings if it does.
      style={
        {
          "--normal-bg": "var(--surface)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--border-color)",
          "--error-bg": "var(--surface)",
          "--error-text": "var(--destructive)",
          "--error-border": "var(--destructive)",
          "--success-bg": "var(--surface)",
          "--success-text": "var(--foreground)",
          "--success-border": "var(--border-color)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
