import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const { manifest, manifestUrl } = useLoaderData() as HomeData;
  const failed = useStore((state) => state.failed);

  const backlog = Object.values(failed);
  const examsWithBacklog = new Set(
    backlog.map((entry) => `${entry.manifestId}|${entry.examNumber}`),
  );

  return (
    <section className="pt-run">
      <Heading level={2} className="text-xs uppercase tracking-[0.18em] text-[var(--ink-dim)]">
        {t("home.lead")}
      </Heading>

      <div className="mt-gap">
        <Lane
          to="/review"
          state={backlog.length > 0 ? "barred" : "open"}
          lead={<Figure size="lead">{backlog.length}</Figure>}
          title={t("home.review.title")}
          description={t("home.review.description")}
          aside={
            <>
              <Figure size="strong" className="block">
                {examsWithBacklog.size}
              </Figure>
              <span className="text-xs text-[var(--ink-dim)]">{t("home.review.aside")}</span>
            </>
          }
        />

        <Lane
          to="/exams"
          lead={<Figure size="lead">{manifest.exams.length}</Figure>}
          title={t("home.exams.title")}
          description={t("home.exams.description")}
          aside={
            <>
              <Figure size="strong" className="block">
                {manifest.generated_at.slice(0, 10)}
              </Figure>
              <span className="text-xs text-[var(--ink-dim)]">{t("home.exams.aside")}</span>
            </>
          }
        />

        <Lane
          to="/endless"
          lead={<Figure size="lead">∞</Figure>}
          title={t("home.endless.title")}
          description={t("home.endless.description")}
          aside={
            <>
              <Figure size="strong" className="block">
                {manifest.exams.length}
              </Figure>
              <span className="text-xs text-[var(--ink-dim)]">{t("home.endless.aside")}</span>
            </>
          }
        />
      </div>

      <RecentExams manifestId={manifestId(manifestUrl)} exams={manifest.exams} />
    </section>
  );
}
