import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import {
  Project,
  SourceFile,
  SyntaxKind,
  Node,
  ClassDeclaration,
  FunctionDeclaration,
  VariableStatement,
} from "ts-morph";

export type NodeType =
  | "file"
  | "module"
  | "class"
  | "function"
  | "const"
  | "route"
  | "schema";

export type EdgeType =
  | "imports"
  | "calls"
  | "extends"
  | "implements"
  | "tested_by"
  | "exports";

export interface GraphNode {
  id: string;
  type: NodeType;
  file: string;
  name: string;
  line_start: number;
  line_end: number;
  exported: boolean;
  jsdoc?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: EdgeType;
}

export interface Graph {
  meta: {
    generated_at: string;
    version: string;
    stats: { files: number; nodes: number; edges: number };
    framework?: string;
  };
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface CacheEntry {
  sha: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface BuildOptions {
  targetDir: string;
  withSummaries?: boolean;
}

const SOURCE_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const IGNORED_DIRS = new Set([
  "node_modules",
  "dist",
  "build",
  ".next",
  ".turbo",
  "out",
  "coverage",
  ".git",
  ".codemap",
  ".cache",
  ".vercel",
]);

const GRAPH_VERSION = "1";

function sha256(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function isSourceFile(name: string): boolean {
  return SOURCE_EXTS.has(path.extname(name));
}

export function walkSourceFiles(root: string): string[] {
  const out: string[] = [];
  function visit(dir: string) {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name.startsWith(".") && entry.name !== "." && entry.name !== "..") {
        if (IGNORED_DIRS.has(entry.name)) continue;
      }
      if (IGNORED_DIRS.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) visit(full);
      else if (entry.isFile() && isSourceFile(entry.name)) out.push(full);
    }
  }
  visit(root);
  return out;
}

function detectFramework(targetDir: string): string | undefined {
  const pkgPath = path.join(targetDir, "package.json");
  if (!fs.existsSync(pkgPath)) return undefined;
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    const deps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
    if (deps.next) return "next";
    if (deps["@remix-run/react"]) return "remix";
    if (deps.astro) return "astro";
    if (deps.vite) return "vite";
    if (deps.express) return "express";
  } catch {
    // ignore
  }
  return undefined;
}

function nextRouteFromFile(rel: string): string | null {
  const norm = rel.split(path.sep).join("/");
  let m = norm.match(/^app\/(.*?)(?:\/page|\/route)\.(?:t|j)sx?$/);
  if (m) {
    const seg = m[1] === "" ? "/" : "/" + m[1].replace(/\/\((.*?)\)/g, "");
    return seg.replace(/\/+/g, "/");
  }
  m = norm.match(/^pages\/(.*?)\.(?:t|j)sx?$/);
  if (m && !m[1].startsWith("api/_") && m[1] !== "_app" && m[1] !== "_document") {
    let p = m[1];
    if (p.endsWith("/index")) p = p.slice(0, -"/index".length);
    return "/" + p;
  }
  return null;
}

function getJSDoc(node: Node): string | undefined {
  if (!Node.isJSDocable(node)) return undefined;
  const docs = node.getJsDocs();
  if (!docs.length) return undefined;
  const text = docs.map((d) => d.getDescription().trim()).filter(Boolean).join("\n");
  return text || undefined;
}

function extractFromSourceFile(
  sf: SourceFile,
  rel: string,
  repoRoot: string,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const fileId = rel;

  nodes.push({
    id: fileId,
    type: "file",
    file: rel,
    name: path.basename(rel),
    line_start: 1,
    line_end: sf.getEndLineNumber(),
    exported: false,
  });

  const route = nextRouteFromFile(rel);
  if (route) {
    nodes.push({
      id: `${fileId}#route:${route}`,
      type: "route",
      file: rel,
      name: route,
      line_start: 1,
      line_end: sf.getEndLineNumber(),
      exported: true,
    });
  }

  for (const imp of sf.getImportDeclarations()) {
    const resolved = imp.getModuleSpecifierSourceFile();
    let target: string;
    if (resolved) {
      target = path
        .relative(repoRoot, resolved.getFilePath())
        .split(path.sep)
        .join("/");
    } else {
      target = imp.getModuleSpecifierValue();
    }
    edges.push({ source: fileId, target, type: "imports" });
  }

  for (const cls of sf.getClasses()) {
    addClass(cls, rel, fileId, nodes, edges);
  }
  for (const fn of sf.getFunctions()) {
    addFunction(fn, rel, fileId, nodes, edges);
  }
  for (const stmt of sf.getVariableStatements()) {
    addVariable(stmt, rel, fileId, nodes, edges);
  }

  return { nodes, edges };
}

function addClass(
  cls: ClassDeclaration,
  rel: string,
  fileId: string,
  nodes: GraphNode[],
  edges: GraphEdge[],
): void {
  const name = cls.getName();
  if (!name) return;
  const id = `${rel}#${name}`;
  const exported = cls.isExported();
  nodes.push({
    id,
    type: "class",
    file: rel,
    name,
    line_start: cls.getStartLineNumber(),
    line_end: cls.getEndLineNumber(),
    exported,
    jsdoc: getJSDoc(cls),
  });
  if (exported) edges.push({ source: fileId, target: id, type: "exports" });
  const ext = cls.getExtends();
  if (ext) edges.push({ source: id, target: ext.getText(), type: "extends" });
  for (const impl of cls.getImplements()) {
    edges.push({ source: id, target: impl.getText(), type: "implements" });
  }
  collectCalls(cls, id, edges);
}

function addFunction(
  fn: FunctionDeclaration,
  rel: string,
  fileId: string,
  nodes: GraphNode[],
  edges: GraphEdge[],
): void {
  const name = fn.getName();
  if (!name) return;
  const id = `${rel}#${name}`;
  const exported = fn.isExported();
  nodes.push({
    id,
    type: "function",
    file: rel,
    name,
    line_start: fn.getStartLineNumber(),
    line_end: fn.getEndLineNumber(),
    exported,
    jsdoc: getJSDoc(fn),
  });
  if (exported) edges.push({ source: fileId, target: id, type: "exports" });
  collectCalls(fn, id, edges);
}

function addVariable(
  stmt: VariableStatement,
  rel: string,
  fileId: string,
  nodes: GraphNode[],
  edges: GraphEdge[],
): void {
  const exported = stmt.isExported();
  for (const decl of stmt.getDeclarations()) {
    const name = decl.getName();
    if (!name) continue;
    const init = decl.getInitializer();
    const isArrowFn =
      init?.getKind() === SyntaxKind.ArrowFunction ||
      init?.getKind() === SyntaxKind.FunctionExpression;
    const id = `${rel}#${name}`;
    nodes.push({
      id,
      type: isArrowFn ? "function" : "const",
      file: rel,
      name,
      line_start: decl.getStartLineNumber(),
      line_end: decl.getEndLineNumber(),
      exported,
      jsdoc: getJSDoc(stmt),
    });
    if (exported) edges.push({ source: fileId, target: id, type: "exports" });
    if (init) collectCalls(init, id, edges);
  }
}

function collectCalls(scope: Node, sourceId: string, edges: GraphEdge[]): void {
  scope.forEachDescendant((descendant) => {
    if (!Node.isCallExpression(descendant)) return;
    const expr = descendant.getExpression();
    let target: string | undefined;
    if (Node.isIdentifier(expr)) target = expr.getText();
    else if (Node.isPropertyAccessExpression(expr)) target = expr.getName();
    if (target) edges.push({ source: sourceId, target, type: "calls" });
  });
}

function ensureGitignore(targetDir: string): void {
  const gi = path.join(targetDir, ".gitignore");
  const line = ".codemap/cache/";
  let content = "";
  if (fs.existsSync(gi)) content = fs.readFileSync(gi, "utf8");
  if (content.split(/\r?\n/).some((l) => l.trim() === line)) return;
  const sep = content.length === 0 || content.endsWith("\n") ? "" : "\n";
  fs.writeFileSync(gi, content + sep + line + "\n");
}

function relpath(targetDir: string, abs: string): string {
  return path.relative(targetDir, abs).split(path.sep).join("/");
}

function loadProject(targetDir: string): Project {
  const tsconfig = path.join(targetDir, "tsconfig.json");
  if (fs.existsSync(tsconfig)) {
    try {
      return new Project({
        tsConfigFilePath: tsconfig,
        skipAddingFilesFromTsConfig: true,
        skipFileDependencyResolution: true,
      });
    } catch (err) {
      console.warn(`[codemap] tsconfig.json could not be parsed (${(err as Error).message}); using defaults.`);
    }
  }
  return new Project({
    skipAddingFilesFromTsConfig: true,
    skipFileDependencyResolution: true,
  });
}

function writeMapMd(
  targetDir: string,
  graph: Graph,
  framework: string | undefined,
): void {
  const mapPath = path.join(targetDir, ".codemap", "MAP.md");
  const fileNodes = graph.nodes.filter((n) => n.type === "file");
  const routeNodes = graph.nodes.filter((n) => n.type === "route");
  const symbolsByFile = new Map<string, GraphNode[]>();
  for (const node of graph.nodes) {
    if (node.type === "file" || node.type === "route") continue;
    const list = symbolsByFile.get(node.file) ?? [];
    list.push(node);
    symbolsByFile.set(node.file, list);
  }

  const moduleBuckets = new Map<string, string[]>();
  for (const fn of fileNodes) {
    const top = fn.file.split("/")[0] || "(root)";
    const list = moduleBuckets.get(top) ?? [];
    list.push(fn.file);
    moduleBuckets.set(top, list);
  }

  const lines: string[] = [];
  lines.push("# Codemap");
  lines.push("");
  lines.push(`> Generated ${graph.meta.generated_at} · v${graph.meta.version}`);
  lines.push("");
  lines.push("## Table of contents");
  lines.push("");
  lines.push("- [Summary](#summary)");
  for (const top of [...moduleBuckets.keys()].sort()) {
    lines.push(`- [Module: \`${top}\`](#module-${top.replace(/[^a-z0-9]+/gi, "-").toLowerCase()})`);
  }
  if (routeNodes.length) lines.push("- [Routes](#routes)");
  lines.push("");

  lines.push("## Summary");
  lines.push("");
  lines.push(`- Files: **${graph.meta.stats.files}**`);
  lines.push(`- Symbols: **${graph.meta.stats.nodes - graph.meta.stats.files - routeNodes.length}**`);
  lines.push(`- Edges: **${graph.meta.stats.edges}**`);
  if (framework) lines.push(`- Framework: **${framework}**`);
  lines.push(`- Top-level: ${[...moduleBuckets.keys()].sort().map((m) => `\`${m}\``).join(", ") || "(none)"}`);
  lines.push("");

  for (const top of [...moduleBuckets.keys()].sort()) {
    const files = moduleBuckets.get(top)!;
    lines.push(`## Module: \`${top}\``);
    lines.push("");
    lines.push(`Files: ${files.length}`);
    lines.push("");
    const exportsHere: GraphNode[] = [];
    for (const f of files) for (const s of symbolsByFile.get(f) ?? []) if (s.exported) exportsHere.push(s);
    if (exportsHere.length) {
      const shown = exportsHere.slice(0, 40);
      lines.push("Public exports:");
      lines.push("");
      for (const s of shown) {
        const doc = s.jsdoc ? ` — ${s.jsdoc.split("\n")[0]}` : "";
        lines.push(`- \`${s.name}\` (${s.type}) — \`${s.file}:${s.line_start}\`${doc}`);
      }
      if (exportsHere.length > shown.length) {
        lines.push(`- … +${exportsHere.length - shown.length} more (see \`graph.json\`)`);
      }
      lines.push("");
    }
  }

  if (routeNodes.length) {
    lines.push("## Routes");
    lines.push("");
    lines.push("| Route | File |");
    lines.push("|---|---|");
    for (const r of routeNodes.sort((a, b) => a.name.localeCompare(b.name))) {
      lines.push(`| \`${r.name}\` | \`${r.file}\` |`);
    }
    lines.push("");
  }

  fs.writeFileSync(mapPath, lines.join("\n"));
}

interface RunResult {
  files: number;
  parsed: number;
  cached: number;
  nodes: number;
  edges: number;
  framework?: string;
  durationMs: number;
}

export function run(opts: BuildOptions, mode: "build" | "update"): RunResult {
  const start = Date.now();
  const targetDir = path.resolve(opts.targetDir);
  if (!fs.existsSync(path.join(targetDir, "package.json"))) {
    throw new Error(
      `ts-codemap is TS/JS only — no package.json in ${targetDir}. Use /ken-swe:codemap for other languages.`,
    );
  }

  const codemapDir = path.join(targetDir, ".codemap");
  const cacheDir = path.join(codemapDir, "cache");
  fs.mkdirSync(cacheDir, { recursive: true });
  ensureGitignore(targetDir);

  if (mode === "build") {
    // wipe stale graph but keep cache; graph is regenerated from cache + new parses
    const graphPath = path.join(codemapDir, "graph.json");
    if (fs.existsSync(graphPath)) fs.rmSync(graphPath);
  }

  const project = loadProject(targetDir);
  const framework = detectFramework(targetDir);
  const absFiles = walkSourceFiles(targetDir);
  const allNodes: GraphNode[] = [];
  const allEdges: GraphEdge[] = [];
  let parsed = 0;
  let cachedHits = 0;

  for (const abs of absFiles) {
    const rel = relpath(targetDir, abs);
    const text = fs.readFileSync(abs, "utf8");
    const sha = sha256(text);
    const cachePath = path.join(cacheDir, `${sha}.json`);

    if (mode === "update" && fs.existsSync(cachePath)) {
      try {
        const entry: CacheEntry = JSON.parse(fs.readFileSync(cachePath, "utf8"));
        allNodes.push(...entry.nodes);
        allEdges.push(...entry.edges);
        cachedHits++;
        continue;
      } catch {
        // fall through to parse
      }
    }

    let sf: SourceFile;
    try {
      sf = project.createSourceFile(abs, text, { overwrite: true });
    } catch (err) {
      console.warn(`[codemap] skipped ${rel}: ${(err as Error).message}`);
      continue;
    }
    let extracted: { nodes: GraphNode[]; edges: GraphEdge[] };
    try {
      extracted = extractFromSourceFile(sf, rel, targetDir);
    } catch (err) {
      console.warn(`[codemap] extraction failed for ${rel}: ${(err as Error).message}`);
      continue;
    } finally {
      project.removeSourceFile(sf);
    }
    fs.writeFileSync(
      cachePath,
      JSON.stringify({ sha, nodes: extracted.nodes, edges: extracted.edges }),
    );
    allNodes.push(...extracted.nodes);
    allEdges.push(...extracted.edges);
    parsed++;
  }

  const graph: Graph = {
    meta: {
      generated_at: new Date().toISOString(),
      version: GRAPH_VERSION,
      stats: {
        files: absFiles.length,
        nodes: allNodes.length,
        edges: allEdges.length,
      },
      framework,
    },
    nodes: allNodes,
    edges: allEdges,
  };

  fs.writeFileSync(
    path.join(codemapDir, "graph.json"),
    JSON.stringify(graph, null, 2),
  );
  writeMapMd(targetDir, graph, framework);

  const sizeBytes = fs.statSync(path.join(codemapDir, "graph.json")).size;
  if (sizeBytes > 5 * 1024 * 1024) {
    console.warn(
      `[codemap] graph.json is ${(sizeBytes / 1024 / 1024).toFixed(1)} MB — consider trimming ignored dirs.`,
    );
  }

  if (opts.withSummaries) {
    console.log(
      "[codemap] --with-summaries was requested. v1 only writes the deterministic map; ask Claude to elaborate per module after the build.",
    );
  }

  return {
    files: absFiles.length,
    parsed,
    cached: cachedHits,
    nodes: allNodes.length,
    edges: allEdges.length,
    framework,
    durationMs: Date.now() - start,
  };
}

export function printSummary(label: string, r: RunResult): void {
  const cacheRate =
    r.files > 0 ? ((r.cached / r.files) * 100).toFixed(0) + "%" : "n/a";
  console.log(`[codemap] ${label} complete in ${r.durationMs}ms`);
  console.log(`  files:   ${r.files}  (parsed ${r.parsed}, cached ${r.cached} / ${cacheRate})`);
  console.log(`  nodes:   ${r.nodes}`);
  console.log(`  edges:   ${r.edges}`);
  if (r.framework) console.log(`  framework: ${r.framework}`);
}
