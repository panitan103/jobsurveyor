import { cp, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";

const pairs = [
  [".next/static", ".next/standalone/.next/static"],
  ["public", ".next/standalone/public"],
];

for (const [from, to] of pairs) {
  if (!existsSync(from)) continue;
  await mkdir(to, { recursive: true });
  await cp(from, to, { recursive: true });
}
console.log("static assets copied");
