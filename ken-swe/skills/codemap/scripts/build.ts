import { run, printSummary } from "./lib";

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith("--"));
const targetDir = positional[0] ?? process.cwd();

(async () => {
  const result = await run({ targetDir }, "build");
  printSummary("build", result);
})().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
