import { Link, NavLink, Outlet, useLocation, useNavigation } from "react-router";
import { cn } from "@/lib/cn";
import { manifestLabel } from "@/lib/manifest-label";
import { activeManifestUrl, useStore } from "@/store/store";
import { ShortcutHelp } from "./ShortcutHelp";
import { ThemeToggle } from "./ThemeToggle";

const routes = [
  { to: "/", label: "Inicio" },
  { to: "/exams", label: "Exámenes" },
  { to: "/review", label: "Falladas" },
  { to: "/endless", label: "Sin fin" },
  { to: "/stats", label: "Estadísticas" },
  { to: "/settings", label: "Ajustes" },
];

const focusedRoutes = ["/review", "/endless"];

export function Shell() {
  const manifestUrl = useStore(activeManifestUrl);
  const navigation = useNavigation();
  const loading = navigation.state === "loading";
  const focused = focusedRoutes.includes(useLocation().pathname);

  return (
    <div className="min-h-dvh">
      <header className={cn(focused ? null : "border-b border-[var(--seam-color)]")}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-baseline gap-x-interval gap-y-dash px-gap py-gap sm:px-run">
          <Link
            to="/"
            className={cn(
              "text-[13px] uppercase tracking-[0.18em]",
              focused && "text-[var(--ink-dim)] hover:text-[var(--ink)]",
            )}
          >
            DGT Tests
          </Link>

          {focused ? null : (
            <Link
              to="/manifests"
              className="text-xs uppercase tracking-[0.1em] text-[var(--ink-dim)] hover:text-[var(--ink)] motion-safe:transition-colors"
            >
              Manifiesto · {manifestLabel(manifestUrl)}
            </Link>
          )}

          <nav className="ms-auto flex flex-wrap items-baseline gap-x-gap gap-y-dash text-[13px]">
            {focused ? (
              <Link
                to="/"
                className="text-[var(--ink-dim)] hover:text-[var(--ink)] motion-safe:transition-colors"
              >
                Salir
              </Link>
            ) : (
              routes.map((route) => (
                <NavLink
                  key={route.to}
                  to={route.to}
                  end={route.to === "/"}
                  className={({ isActive }) =>
                    cn(
                      "pb-[2px] text-[var(--ink-dim)] hover:text-[var(--ink)] motion-safe:transition-colors",
                      isActive &&
                        "text-[var(--ink)] shadow-[inset_0_-2px_0_var(--color-temporary)]",
                    )
                  }
                >
                  {route.label}
                </NavLink>
              ))
            )}
            <ShortcutHelp />
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

      <main className={cn("mx-auto px-gap pb-run sm:px-run", focused ? "max-w-4xl" : "max-w-6xl")}>
        <Outlet />
      </main>
    </div>
  );
}
