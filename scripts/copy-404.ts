const dist = new URL("../dist/", import.meta.url);
const index = Bun.file(new URL("index.html", dist));

if (!(await index.exists())) {
  console.error("dist/index.html does not exist: run the build before copying 404 file");
  process.exit(1);
}

await Bun.write(new URL("404.html", dist), index);
console.log("dist/404.html created");
