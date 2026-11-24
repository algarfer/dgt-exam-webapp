import { useLoaderData } from "react-router";
import { RecentExams } from "@/components/RecentExams";
import { Figure } from "@/components/ui/Figure";
import { Heading } from "@/components/ui/Heading";
import { Lane } from "@/components/ui/Lane";
import { fetchManifest } from "@/data/repository";
import type { Manifest } from "@/data/types";
import { manifestId } from "@/lib/manifest-id";
import { activeManifestUrl, useStore } from "@/store/store";

type HomeData = {
  manifest: Manifest;
  manifestUrl: string;
};

export async function homeLoader(): Promise<HomeData> {
  const manifestUrl = activeManifestUrl(useStore.getState());
  return { manifest: await fetchManifest(manifestUrl), manifestUrl };
}

export function Home() {
  const { manifest, manifestUrl } = useLoaderData() as HomeData;
  const failed = useStore((state) => state.failed);

  const backlog = Object.values(failed);
  const examsWithBacklog = new Set(
    backlog.map((entry) => `${entry.manifestId}|${entry.examNumber}`),
  );

  return (
    <section className="pt-run">
      <Heading level={2} className="text-xs uppercase tracking-[0.18em] text-[var(--ink-dim)]">
        ¿Qué quieres hacer?
      </Heading>

      <div className="mt-gap">
        <Lane
          to="/review"
          state={backlog.length > 0 ? "barred" : "open"}
          lead={<Figure size="lead">{backlog.length}</Figure>}
          title="Repasar las preguntas falladas"
          description="Preguntas que has fallado en cualquier test."
          aside={
            <>
              <Figure size="strong" className="block">
                {examsWithBacklog.size}
              </Figure>
              <span className="text-xs text-[var(--ink-dim)]">exámenes</span>
            </>
          }
        />

        <Lane
          to="/exams"
          lead={<Figure size="lead">{manifest.exams.length}</Figure>}
          title="Exámenes"
          description="Realiza exámenes en modo estudio o en modo examen."
          aside={
            <>
              <Figure size="strong" className="block">
                {manifest.generated_at.slice(0, 10)}
              </Figure>
              <span className="text-xs text-[var(--ink-dim)]">manifiesto generado</span>
            </>
          }
        />

        <Lane
          to="/endless"
          lead={<Figure size="lead">∞</Figure>}
          title="Sin fin"
          description="Preguntas de todos los exámenes disponibles."
          aside={
            <>
              <Figure size="strong" className="block">
                {manifest.exams.length}
              </Figure>
              <span className="text-xs text-[var(--ink-dim)]">exámenes</span>
            </>
          }
        />
      </div>

      <RecentExams manifestId={manifestId(manifestUrl)} exams={manifest.exams} />
    </section>
  );
}
