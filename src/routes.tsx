import { createBrowserRouter } from "react-router";
import { Shell } from "@/components/Shell";
import { Endless, endlessLoader } from "@/modes/endless/Endless";
import { ExamRun, examRunLoader } from "@/modes/exam/ExamRun";
import { ExamList, examListLoader } from "@/modes/exam-list/ExamList";
import { Review } from "@/modes/review/Review";
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
      { path: "exams", Component: ExamList, loader: examListLoader },
      { path: "exams/:number", Component: ExamRun, loader: examRunLoader },
      { path: "review", Component: Review },
      { path: "endless", Component: Endless, loader: endlessLoader },
      { path: "stats", Component: () => <Placeholder title="Estadísticas" /> },
      { path: "settings", Component: () => <Placeholder title="Ajustes" /> },
      { path: "manifests", Component: () => <Placeholder title="Manifiestos" /> },
      { path: "*", Component: NotFound },
    ],
  },
]);
