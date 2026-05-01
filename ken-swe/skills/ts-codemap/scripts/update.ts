import { run, printSummary } from "./lib";

const args = process.argv.slice(2);
const withSummaries = args.includes("--with-summaries");
const positional = args.filter((a) => !a.startsWith("--"));
const targetDir = positional[0] ?? process.cwd();

const result = run({ targetDir, withSummaries }, "update");
printSummary("update", result);
