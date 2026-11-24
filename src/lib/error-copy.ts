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
      title: "No se ha podido conectar",
      detail: `El navegador no ha podido descargar ${error.url}. O no hay conexión, o el servidor no permite peticiones desde esta web.`,
      recovery: "Comprueba tu conexión y vuelve a intentarlo.",
    };
  }

  if (error instanceof HttpError) {
    return {
      title: error.status === 404 ? "El archivo no existe" : "El servidor ha devuelto un error",
      detail: `${error.url} ha respondido ${error.status}.`,
      recovery:
        error.status === 404 ? "Revisa la URL del manifiesto." : "Vuelve a intentarlo más tarde.",
    };
  }

  if (error instanceof ParseError) {
    return {
      title: "La respuesta no es un JSON",
      detail: `${error.url} no ha devuelto un JSON válido.`,
      recovery: "Revisa el contenido de la URL.",
    };
  }

  if (error instanceof SchemaValidationError) {
    return {
      title: "El JSON no sigue el esquema",
      detail: "Es un JSON válido, pero no tiene el formato que espera la aplicación.",
      recovery: "Comprueba que el manifiesto sigue los esquemas de dgt-exam-scraper.",
      details: error.details,
    };
  }

  return {
    title: "Algo ha fallado",
    detail: error instanceof Error ? error.message : "Error desconocido.",
    recovery: "Vuelve a cargar la página.",
  };
}
