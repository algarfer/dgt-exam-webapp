import { paletteCss } from "./palette.mjs";

const target = new URL("../src/design/palette.css", import.meta.url);

await Bun.write(target, paletteCss());
console.log("src/design/palette.css written");
