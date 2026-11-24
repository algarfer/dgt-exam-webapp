import { mkdir } from "node:fs/promises";

const DEFAULT_SOURCE =
  "https://raw.githubusercontent.com/algarfer/dgt-exam-scraper/master/schemas/";
const FILES = ["manifest.schema.json", "exam.schema.json"];

const source = process.env.SCHEMAS_SOURCE ?? DEFAULT_SOURCE;
const base = source.endsWith("/") ? source : `${source}/`;

const target = new URL("../src/data/schemas/", import.meta.url);
const force = process.argv.includes("--force");

await mkdir(target, { recursive: true });

for (const file of FILES) {
  const destination = new URL(file, target);

  if (!force && (await Bun.file(destination).exists())) {
    console.log(`${file} already present, skipping`);
    continue;
  }

  const response = await fetch(new URL(file, base));
  if (!response.ok) {
    console.error(`Could not fetch ${file}: ${response.status} ${response.statusText}`);
    process.exit(1);
  }

  const schema = await response.json();
  await Bun.write(destination, `${JSON.stringify(schema, null, 2)}\n`);
  console.log(`${file} written`);
}
