import { useTranslation } from "react-i18next";
import { Heading } from "@/components/ui/Heading";

/** Temporary: each of these routes is built in its own commit. */
export function Placeholder({ title }: { title: string }) {
  const { t } = useTranslation();

  return (
    <section className="py-run">
      <Heading>{title}</Heading>
      <p className="mt-gap max-w-[65ch] text-[var(--ink-dim)]">{t("common.underConstruction")}</p>
    </section>
  );
}
