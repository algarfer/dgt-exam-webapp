import { createBrowserRouter } from "react-router";
import { Shell } from "@/components/Shell";
import { Home, homeLoader } from "@/pages/Home";
import { NotFound } from "@/pages/NotFound";
import { Placeholder } from "@/pages/Placeholder";
import { RouteError } from "@/pages/RouteError";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Shell,
    ErrorBoundary: RouteError,
    children: [
      { index: true, Component: Home, loader: homeLoader },
      { path: "exams", Component: () => <Placeholder title="Exámenes" /> },
      { path: "exams/:number", Component: () => <Placeholder title="Examen" /> },
      { path: "review", Component: () => <Placeholder title="Tus preguntas falladas" /> },
      { path: "endless", Component: () => <Placeholder title="Modo sin fin" /> },
      { path: "stats", Component: () => <Placeholder title="Estadísticas" /> },
      { path: "settings", Component: () => <Placeholder title="Ajustes" /> },
      { path: "manifests", Component: () => <Placeholder title="Manifiestos" /> },
      { path: "*", Component: NotFound },
    ],
  },
]);
