import { Link, NavLink, Outlet, useNavigation } from "react-router";
import { cn } from "@/lib/cn";
import { manifestLabel } from "@/lib/manifest-label";
import { activeManifestUrl, useStore } from "@/store/store";
import { ThemeToggle } from "./ThemeToggle";

const routes = [
  { to: "/", label: "Inicio" },
  { to: "/exams", label: "Exámenes" },
  { to: "/review", label: "Falladas" },
  { to: "/endless", label: "Sin fin" },
  { to: "/stats", label: "Estadísticas" },
  { to: "/settings", label: "Ajustes" },
];

export function Shell() {
  const manifestUrl = useStore(activeManifestUrl);
  const navigation = useNavigation();
  const loading = navigation.state === "loading";

  return (
    <div className="min-h-dvh">
      <header className="border-b border-[var(--seam-color)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-baseline gap-x-interval gap-y-dash px-gap py-gap sm:px-run">
          <Link to="/" className="text-[13px] uppercase tracking-[0.18em]">
            DGT Tests
          </Link>

          <Link
            to="/manifests"
            className="text-xs uppercase tracking-[0.1em] text-[var(--ink-dim)] hover:text-[var(--ink)] motion-safe:transition-colors"
          >
            Manifiesto · {manifestLabel(manifestUrl)}
          </Link>

          <nav className="ms-auto flex flex-wrap items-baseline gap-x-gap gap-y-dash text-[13px]">
            {routes.map((route) => (
              <NavLink
                key={route.to}
                to={route.to}
                end={route.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "pb-[2px] text-[var(--ink-dim)] hover:text-[var(--ink)] motion-safe:transition-colors",
                    isActive && "text-[var(--ink)] shadow-[inset_0_-2px_0_var(--color-temporary)]",
                  )
                }
              >
                {route.label}
              </NavLink>
            ))}
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Loading is a painted line advancing, not a spinner. */}
      <div
        aria-hidden="true"
        className={cn(
          "h-[2px] bg-temporary origin-left motion-safe:transition-transform motion-safe:duration-300",
          loading ? "scale-x-100" : "scale-x-0",
        )}
      />

      <main className="mx-auto max-w-6xl px-gap pb-run sm:px-run">
        <Outlet />
      </main>
    </div>
  );
}
