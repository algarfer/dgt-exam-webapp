import { Ajv2020, type ErrorObject, type ValidateFunction } from "ajv/dist/2020";
import addFormats from "ajv-formats";
import { SchemaValidationError } from "./errors";
import examSchema from "./schemas/exam.schema.json";
import manifestSchema from "./schemas/manifest.schema.json";
import type { Exam, Manifest } from "./types";

const ajv = new Ajv2020({ strict: false, allErrors: true });
addFormats(ajv);

const validateManifestSchema = ajv.compile(manifestSchema) as ValidateFunction<Manifest>;
const validateExamSchema = ajv.compile(examSchema) as ValidateFunction<Exam>;

function describe(errors: ErrorObject[] | null | undefined): string[] {
  if (!errors) return [];

  return errors.map((error) => {
    const path = error.instancePath || "/";
    return `${path}: ${error.message ?? "invalid"}`;
  });
}

export function validateManifest(data: unknown): Manifest {
  if (validateManifestSchema(data)) return data;
  throw new SchemaValidationError("manifest", describe(validateManifestSchema.errors));
}

export function validateExam(data: unknown): Exam {
  if (validateExamSchema(data)) return data;
  throw new SchemaValidationError("exam", describe(validateExamSchema.errors));
}
