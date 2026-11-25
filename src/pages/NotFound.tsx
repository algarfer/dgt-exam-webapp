import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Figure } from "@/components/ui/Figure";
import { Heading } from "@/components/ui/Heading";

export function NotFound() {
  const { t } = useTranslation();

  return (
    <section className="py-run">
      <Figure size="lead" className="block text-temporary">
        404
      </Figure>
      <Heading className="mt-gap">{t("notFound.title")}</Heading>
      <p className="mt-gap max-w-[65ch] text-[var(--ink-dim)]">{t("notFound.body")}</p>
      <Link to="/" className="mt-interval inline-block underline">
        {t("common.backHome")}
      </Link>
    </section>
  );
}
