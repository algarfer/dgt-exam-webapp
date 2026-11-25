import { useTranslation } from "react-i18next";
import { Link, useRouteError } from "react-router";
import { Heading } from "@/components/ui/Heading";
import { errorCopy } from "@/lib/error-copy";

export function RouteError() {
  const { t } = useTranslation();
  const { title, detail, recovery, details } = errorCopy(useRouteError());

  return (
    <section className="py-run">
      <Heading className="text-temporary">{title}</Heading>
      <p className="mt-gap max-w-[65ch]">{detail}</p>
      <p className="mt-dash max-w-[65ch] text-[var(--ink-dim)]">{recovery}</p>

      {details?.length ? (
        <ul className="mt-interval space-y-dash border-t border-[var(--seam-color)] pt-gap font-mono text-xs text-[var(--ink-dim)]">
          {details.slice(0, 8).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}

      <Link to="/" className="mt-interval inline-block underline">
        {t("common.backHome")}
      </Link>
    </section>
  );
}
