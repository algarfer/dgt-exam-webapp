import { t } from "i18next";
import { HttpError, NetworkError, ParseError, SchemaValidationError } from "@/data/errors";

export type ErrorCopy = {
  title: string;
  detail: string;
  recovery: string;
  details?: string[];
};

export function errorCopy(error: unknown): ErrorCopy {
  if (error instanceof NetworkError) {
    return {
      title: t("errors.network.title"),
      detail: t("errors.network.detail", { url: error.url }),
      recovery: t("errors.network.recovery"),
    };
  }

  if (error instanceof HttpError) {
    const missing = error.status === 404;

    return {
      title: missing ? t("errors.http.notFoundTitle") : t("errors.http.serverTitle"),
      detail: t("errors.http.detail", { url: error.url, status: error.status }),
      recovery: missing ? t("errors.http.notFoundRecovery") : t("errors.http.serverRecovery"),
    };
  }

  if (error instanceof ParseError) {
    return {
      title: t("errors.parse.title"),
      detail: t("errors.parse.detail", { url: error.url }),
      recovery: t("errors.parse.recovery"),
    };
  }

  if (error instanceof SchemaValidationError) {
    return {
      title: t("errors.schema.title"),
      detail: t("errors.schema.detail"),
      recovery: t("errors.schema.recovery"),
      details: error.details,
    };
  }

  return {
    title: t("errors.unknown.title"),
    detail: error instanceof Error ? error.message : t("errors.unknown.detail"),
    recovery: t("errors.unknown.recovery"),
  };
}
