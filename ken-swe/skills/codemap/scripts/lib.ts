import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Parser = require("web-tree-sitter");

export type Lang = "python" | "java" | "go" | "rust";

export type NodeType =
  | "file"
  | "module"
  | "class"
  | "function"
  | "const"
  | "schema";

export type EdgeType =
  | "imports"
  | "calls"
  | "extends"
  | "implements"
  | "exports";

export interface GraphNode {
  id: string;
  type: NodeType;
  file: string;
  name: string;
  line_start: number;
  line_end: number;
  exported: boolean;
  lang?: Lang;
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
    languages: Partial<Record<Lang, number>>;
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
}

const GRAPH_VERSION = "1";

const EXT_TO_LANG: Record<string, Lang> = {
  ".py": "python",
  ".java": "java",
  ".go": "go",
  ".rs": "rust",
};

const IGNORED_DIRS = new Set([
  "node_modules",
  "dist",
  "build",
  "target",
  "vendor",
  ".git",
  ".codemap",
  ".cache",
  "__pycache__",
  ".venv",
  "venv",
  ".tox",
  ".mypy_cache",
  ".pytest_cache",
  ".gradle",
  "out",
  "bin",
  "obj",
]);

function sha256(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function langFor(file: string): Lang | undefined {
  return EXT_TO_LANG[path.extname(file)];
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
      if (IGNORED_DIRS.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) visit(full);
      else if (entry.isFile() && langFor(entry.name)) out.push(full);
    }
  }
  visit(root);
  return out;
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

interface TSNode {
  type: string;
  text: string;
  startPosition: { row: number; column: number };
  endPosition: { row: number; column: number };
  children: TSNode[];
  namedChildren: TSNode[];
  childForFieldName(name: string): TSNode | null;
  parent: TSNode | null;
  walk(): unknown;
}

interface TSTree {
  rootNode: TSNode;
}

interface TSGrammar {
  query(source: string): TSQuery;
}

interface TSQueryCapture {
  name: string;
  node: TSNode;
}

interface TSQuery {
  captures(node: TSNode): TSQueryCapture[];
}

interface TSParser {
  setLanguage(g: TSGrammar): void;
  parse(src: string): TSTree;
}

const grammarCache = new Map<Lang, TSGrammar>();
let parserInitDone = false;

async function ensureParserInit(): Promise<void> {
  if (parserInitDone) return;
  await Parser.init();
  parserInitDone = true;
}

function grammarPath(lang: Lang): string {
  return require.resolve(`tree-sitter-wasms/out/tree-sitter-${lang}.wasm`);
}

async function loadGrammar(lang: Lang): Promise<TSGrammar | null> {
  if (grammarCache.has(lang)) return grammarCache.get(lang)!;
  try {
    const g: TSGrammar = await Parser.Language.load(grammarPath(lang));
    grammarCache.set(lang, g);
    return g;
  } catch (err) {
    console.warn(`[codemap] failed to load ${lang} grammar: ${(err as Error).message}`);
    return null;
  }
}

function newParser(g: TSGrammar): TSParser {
  const p = new Parser() as TSParser;
  p.setLanguage(g);
  return p;
}

function lineOf(node: TSNode): number {
  return node.startPosition.row + 1;
}

function endLineOf(node: TSNode): number {
  return node.endPosition.row + 1;
}

function fieldText(node: TSNode, field: string): string | undefined {
  return node.childForFieldName(field)?.text;
}

function pushNode(
  nodes: GraphNode[],
  rel: string,
  lang: Lang,
  type: NodeType,
  name: string,
  start: number,
  end: number,
  exported: boolean,
  qualifier?: string,
): string {
  const fullName = qualifier ? `${qualifier}.${name}` : name;
  const id = `${rel}#${fullName}`;
  nodes.push({
    id,
    type,
    file: rel,
    name: fullName,
    line_start: start,
    line_end: end,
    exported,
    lang,
  });
  return id;
}

interface ExtractCtx {
  rel: string;
  fileId: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// ---------- Python ----------
function extractPython(root: TSNode, grammar: TSGrammar, ctx: ExtractCtx): void {
  const { rel, fileId, nodes, edges } = ctx;
  const q = grammar.query(`
    (import_statement) @imp
    (import_from_statement) @imp_from
  `);
  for (const cap of q.captures(root)) {
    const target = cap.node.text.replace(/^import\s+|^from\s+|\s+import\s+.*$/g, "").trim();
    edges.push({ source: fileId, target, type: "imports" });
  }

  function visit(node: TSNode, classCtx?: { name: string; id: string }) {
    if (node.type === "class_definition") {
      const name = fieldText(node, "name");
      if (!name) return;
      const id = pushNode(nodes, rel, "python", "class", name, lineOf(node), endLineOf(node), true);
      edges.push({ source: fileId, target: id, type: "exports" });
      const supers = node.childForFieldName("superclasses");
      if (supers) {
        for (const child of supers.namedChildren) {
          if (child.type === "identifier" || child.type === "attribute") {
            edges.push({ source: id, target: child.text, type: "extends" });
          }
        }
      }
      const body = node.childForFieldName("body");
      if (body) for (const c of body.namedChildren) visit(c, { name, id });
      return;
    }
    if (node.type === "function_definition") {
      const name = fieldText(node, "name");
      if (!name) return;
      const exported = !name.startsWith("_") || classCtx !== undefined;
      const id = pushNode(
        nodes,
        rel,
        "python",
        "function",
        name,
        lineOf(node),
        endLineOf(node),
        exported,
        classCtx?.name,
      );
      if (!classCtx) edges.push({ source: fileId, target: id, type: "exports" });
      collectCallsPython(node, id, edges);
      return;
    }
    if (node.type === "decorated_definition") {
      const def = node.childForFieldName("definition");
      if (def) visit(def, classCtx);
      return;
    }
    for (const child of node.namedChildren) visit(child, classCtx);
  }
  visit(root);
}

function collectCallsPython(scope: TSNode, sourceId: string, edges: GraphEdge[]): void {
  function walk(n: TSNode) {
    if (n.type === "call") {
      const fn = n.childForFieldName("function");
      if (fn) {
        let name: string | undefined;
        if (fn.type === "identifier") name = fn.text;
        else if (fn.type === "attribute") name = fieldText(fn, "attribute");
        if (name) edges.push({ source: sourceId, target: name, type: "calls" });
      }
    }
    for (const c of n.namedChildren) walk(c);
  }
  walk(scope);
}

// ---------- Java ----------
function extractJava(root: TSNode, grammar: TSGrammar, ctx: ExtractCtx): void {
  const { rel, fileId, nodes, edges } = ctx;

  for (const c of root.namedChildren) {
    if (c.type === "import_declaration") {
      const inner = c.namedChildren[0];
      if (inner) edges.push({ source: fileId, target: inner.text, type: "imports" });
    }
  }

  function visit(node: TSNode, classCtx?: { name: string; id: string }) {
    if (node.type === "class_declaration" || node.type === "record_declaration") {
      const name = fieldText(node, "name");
      if (!name) return;
      const id = pushNode(nodes, rel, "java", "class", name, lineOf(node), endLineOf(node), isJavaExported(node));
      edges.push({ source: fileId, target: id, type: "exports" });
      const sup = node.childForFieldName("superclass");
      if (sup) for (const t of sup.namedChildren) edges.push({ source: id, target: t.text, type: "extends" });
      const ifaces = node.childForFieldName("interfaces");
      if (ifaces) {
        for (const list of ifaces.namedChildren) {
          for (const t of list.namedChildren) edges.push({ source: id, target: t.text, type: "implements" });
        }
      }
      const body = node.childForFieldName("body");
      if (body) for (const c of body.namedChildren) visit(c, { name, id });
      return;
    }
    if (node.type === "interface_declaration") {
      const name = fieldText(node, "name");
      if (!name) return;
      const id = pushNode(nodes, rel, "java", "class", name, lineOf(node), endLineOf(node), isJavaExported(node));
      edges.push({ source: fileId, target: id, type: "exports" });
      const ext = node.childForFieldName("extends_interfaces");
      if (ext) {
        for (const list of ext.namedChildren) {
          for (const t of list.namedChildren) edges.push({ source: id, target: t.text, type: "extends" });
        }
      }
      const body = node.childForFieldName("body");
      if (body) for (const c of body.namedChildren) visit(c, { name, id });
      return;
    }
    if (node.type === "method_declaration" && classCtx) {
      const name = fieldText(node, "name");
      if (!name) return;
      const id = pushNode(
        nodes,
        rel,
        "java",
        "function",
        name,
        lineOf(node),
        endLineOf(node),
        isJavaExported(node),
        classCtx.name,
      );
      collectCallsJava(node, id, edges);
      return;
    }
    for (const child of node.namedChildren) visit(child, classCtx);
  }
  visit(root);
}

function isJavaExported(node: TSNode): boolean {
  const mods = node.namedChildren.find((c) => c.type === "modifiers");
  if (!mods) return false;
  return mods.text.includes("public") || mods.text.includes("protected");
}

function collectCallsJava(scope: TSNode, sourceId: string, edges: GraphEdge[]): void {
  function walk(n: TSNode) {
    if (n.type === "method_invocation") {
      const name = fieldText(n, "name");
      if (name) edges.push({ source: sourceId, target: name, type: "calls" });
    }
    for (const c of n.namedChildren) walk(c);
  }
  walk(scope);
}

// ---------- Go ----------
function extractGo(root: TSNode, grammar: TSGrammar, ctx: ExtractCtx): void {
  const { rel, fileId, nodes, edges } = ctx;

  function collectImports(node: TSNode) {
    if (node.type === "import_spec") {
      const p = node.childForFieldName("path");
      if (p) {
        const t = p.text.replace(/^"|"$/g, "");
        edges.push({ source: fileId, target: t, type: "imports" });
      }
      return;
    }
    for (const c of node.namedChildren) collectImports(c);
  }
  for (const c of root.namedChildren) {
    if (c.type === "import_declaration") collectImports(c);
  }

  for (const c of root.namedChildren) {
    if (c.type === "type_declaration") {
      for (const spec of c.namedChildren) {
        if (spec.type !== "type_spec") continue;
        const name = fieldText(spec, "name");
        const t = spec.childForFieldName("type");
        if (!name || !t) continue;
        const kind: NodeType = t.type === "interface_type" ? "schema" : "class";
        const id = pushNode(nodes, rel, "go", kind, name, lineOf(spec), endLineOf(spec), isGoExported(name));
        edges.push({ source: fileId, target: id, type: "exports" });
      }
    } else if (c.type === "function_declaration") {
      const name = fieldText(c, "name");
      if (!name) continue;
      const id = pushNode(nodes, rel, "go", "function", name, lineOf(c), endLineOf(c), isGoExported(name));
      edges.push({ source: fileId, target: id, type: "exports" });
      collectCallsGo(c, id, edges);
    } else if (c.type === "method_declaration") {
      const name = fieldText(c, "name");
      if (!name) continue;
      const recv = c.childForFieldName("receiver");
      const recvType = recv ? extractGoReceiverType(recv) : undefined;
      const id = pushNode(
        nodes,
        rel,
        "go",
        "function",
        name,
        lineOf(c),
        endLineOf(c),
        isGoExported(name),
        recvType,
      );
      collectCallsGo(c, id, edges);
    }
  }
}

function isGoExported(name: string): boolean {
  return /^[A-Z]/.test(name);
}

function extractGoReceiverType(recv: TSNode): string | undefined {
  for (const p of recv.namedChildren) {
    if (p.type !== "parameter_declaration") continue;
    const t = p.childForFieldName("type");
    if (!t) continue;
    if (t.type === "pointer_type") {
      const inner = t.namedChildren[0];
      return inner?.text;
    }
    return t.text;
  }
  return undefined;
}

function collectCallsGo(scope: TSNode, sourceId: string, edges: GraphEdge[]): void {
  function walk(n: TSNode) {
    if (n.type === "call_expression") {
      const fn = n.childForFieldName("function");
      if (fn) {
        let name: string | undefined;
        if (fn.type === "identifier") name = fn.text;
        else if (fn.type === "selector_expression") name = fieldText(fn, "field");
        if (name) edges.push({ source: sourceId, target: name, type: "calls" });
      }
    }
    for (const c of n.namedChildren) walk(c);
  }
  walk(scope);
}

// ---------- Rust ----------
function extractRust(root: TSNode, grammar: TSGrammar, ctx: ExtractCtx): void {
  const { rel, fileId, nodes, edges } = ctx;

  for (const c of root.namedChildren) {
    if (c.type === "use_declaration") {
      const arg = c.childForFieldName("argument");
      if (arg) edges.push({ source: fileId, target: arg.text, type: "imports" });
    }
  }

  function visit(node: TSNode, implCtx?: { typeName: string; id: string }) {
    if (node.type === "function_item") {
      const name = fieldText(node, "name");
      if (!name) return;
      const exported = isRustPublic(node) || implCtx !== undefined;
      const id = pushNode(
        nodes,
        rel,
        "rust",
        "function",
        name,
        lineOf(node),
        endLineOf(node),
        exported,
        implCtx?.typeName,
      );
      if (!implCtx) edges.push({ source: fileId, target: id, type: "exports" });
      collectCallsRust(node, id, edges);
      return;
    }
    if (
      node.type === "struct_item" ||
      node.type === "enum_item" ||
      node.type === "trait_item" ||
      node.type === "union_item"
    ) {
      const name = fieldText(node, "name");
      if (!name) return;
      const kind: NodeType = node.type === "trait_item" ? "schema" : "class";
      const id = pushNode(nodes, rel, "rust", kind, name, lineOf(node), endLineOf(node), isRustPublic(node));
      edges.push({ source: fileId, target: id, type: "exports" });
      return;
    }
    if (node.type === "impl_item") {
      const trait = node.childForFieldName("trait");
      const ty = node.childForFieldName("type");
      const typeName = ty?.text;
      if (typeName && trait) {
        edges.push({ source: `${rel}#${typeName}`, target: trait.text, type: "implements" });
      }
      const body = node.childForFieldName("body");
      if (body && typeName) {
        for (const c of body.namedChildren) visit(c, { typeName, id: `${rel}#${typeName}` });
      }
      return;
    }
    for (const child of node.namedChildren) visit(child, implCtx);
  }
  visit(root);
}

function isRustPublic(node: TSNode): boolean {
  return node.namedChildren.some((c) => c.type === "visibility_modifier");
}

function collectCallsRust(scope: TSNode, sourceId: string, edges: GraphEdge[]): void {
  function walk(n: TSNode) {
    if (n.type === "call_expression") {
      const fn = n.childForFieldName("function");
      if (fn) {
        let name: string | undefined;
        if (fn.type === "identifier") name = fn.text;
        else if (fn.type === "field_expression") name = fieldText(fn, "field");
        else if (fn.type === "scoped_identifier") name = fieldText(fn, "name");
        if (name) edges.push({ source: sourceId, target: name, type: "calls" });
      }
    }
    if (n.type === "macro_invocation") {
      const m = n.childForFieldName("macro");
      if (m) edges.push({ source: sourceId, target: m.text + "!", type: "calls" });
    }
    for (const c of n.namedChildren) walk(c);
  }
  walk(scope);
}

// ---------- Dispatcher ----------
const EXTRACTORS: Record<Lang, (root: TSNode, g: TSGrammar, ctx: ExtractCtx) => void> = {
  python: extractPython,
  java: extractJava,
  go: extractGo,
  rust: extractRust,
};

async function extractFile(
  abs: string,
  rel: string,
  text: string,
): Promise<{ nodes: GraphNode[]; edges: GraphEdge[]; lang: Lang } | null> {
  const lang = langFor(abs);
  if (!lang) return null;
  const grammar = await loadGrammar(lang);
  if (!grammar) return null;
  const parser = newParser(grammar);
  let tree: TSTree;
  try {
    tree = parser.parse(text);
  } catch (err) {
    console.warn(`[codemap] parse failed for ${rel}: ${(err as Error).message}`);
    return null;
  }
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const fileId = rel;
  nodes.push({
    id: fileId,
    type: "file",
    file: rel,
    name: path.basename(rel),
    line_start: 1,
    line_end: tree.rootNode.endPosition.row + 1,
    exported: false,
    lang,
  });
  const ctx: ExtractCtx = { rel, fileId, nodes, edges };
  try {
    EXTRACTORS[lang](tree.rootNode, grammar, ctx);
  } catch (err) {
    console.warn(`[codemap] extraction failed for ${rel}: ${(err as Error).message}`);
  }
  return { nodes, edges, lang };
}

// ---------- MAP.md renderer ----------
function writeMapMd(targetDir: string, graph: Graph): void {
  const mapPath = path.join(targetDir, ".codemap", "MAP.md");
  const fileNodes = graph.nodes.filter((n) => n.type === "file");
  const symbolsByFile = new Map<string, GraphNode[]>();
  for (const node of graph.nodes) {
    if (node.type === "file") continue;
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
  lines.push(`> Generated ${graph.meta.generated_at} · v${graph.meta.version} · tree-sitter`);
  lines.push("");
  lines.push("## Table of contents");
  lines.push("");
  lines.push("- [Summary](#summary)");
  for (const top of [...moduleBuckets.keys()].sort()) {
    lines.push(`- [Module: \`${top}\`](#module-${top.replace(/[^a-z0-9]+/gi, "-").toLowerCase()})`);
  }
  lines.push("");

  lines.push("## Summary");
  lines.push("");
  lines.push(`- Files: **${graph.meta.stats.files}**`);
  lines.push(`- Symbols: **${graph.meta.stats.nodes - graph.meta.stats.files}**`);
  lines.push(`- Edges: **${graph.meta.stats.edges}**`);
  const langCounts = Object.entries(graph.meta.languages)
    .filter(([, v]) => (v ?? 0) > 0)
    .map(([k, v]) => `${k} (${v})`);
  if (langCounts.length) lines.push(`- Languages: ${langCounts.join(", ")}`);
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
      lines.push("Public symbols:");
      lines.push("");
      for (const s of shown) {
        lines.push(`- \`${s.name}\` (${s.type}, ${s.lang}) — \`${s.file}:${s.line_start}\``);
      }
      if (exportsHere.length > shown.length) {
        lines.push(`- … +${exportsHere.length - shown.length} more (see \`graph.json\`)`);
      }
      lines.push("");
    }
  }

  fs.writeFileSync(mapPath, lines.join("\n"));
}

interface RunResult {
  files: number;
  parsed: number;
  cached: number;
  nodes: number;
  edges: number;
  languages: Partial<Record<Lang, number>>;
  durationMs: number;
}

export async function run(opts: BuildOptions, mode: "build" | "update"): Promise<RunResult> {
  const start = Date.now();
  const targetDir = path.resolve(opts.targetDir);
  await ensureParserInit();

  const absFiles = walkSourceFiles(targetDir);
  if (absFiles.length === 0) {
    throw new Error(
      `No Java/Go/Python/Rust source files found under ${targetDir}. For TS/JS repos, use /ken-swe:ts-codemap.`,
    );
  }

  const codemapDir = path.join(targetDir, ".codemap");
  const cacheDir = path.join(codemapDir, "cache");
  fs.mkdirSync(cacheDir, { recursive: true });
  ensureGitignore(targetDir);

  if (mode === "build") {
    const graphPath = path.join(codemapDir, "graph.json");
    if (fs.existsSync(graphPath)) fs.rmSync(graphPath);
  }

  const allNodes: GraphNode[] = [];
  const allEdges: GraphEdge[] = [];
  const langCounts: Partial<Record<Lang, number>> = {};
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
        const lang = langFor(abs)!;
        langCounts[lang] = (langCounts[lang] ?? 0) + 1;
        cachedHits++;
        continue;
      } catch {
        // fall through to parse
      }
    }

    const result = await extractFile(abs, rel, text);
    if (!result) continue;
    fs.writeFileSync(
      cachePath,
      JSON.stringify({ sha, nodes: result.nodes, edges: result.edges }),
    );
    allNodes.push(...result.nodes);
    allEdges.push(...result.edges);
    langCounts[result.lang] = (langCounts[result.lang] ?? 0) + 1;
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
      languages: langCounts,
    },
    nodes: allNodes,
    edges: allEdges,
  };

  fs.writeFileSync(
    path.join(codemapDir, "graph.json"),
    JSON.stringify(graph, null, 2),
  );
  writeMapMd(targetDir, graph);

  const sizeBytes = fs.statSync(path.join(codemapDir, "graph.json")).size;
  if (sizeBytes > 5 * 1024 * 1024) {
    console.warn(
      `[codemap] graph.json is ${(sizeBytes / 1024 / 1024).toFixed(1)} MB — consider trimming ignored dirs.`,
    );
  }

  return {
    files: absFiles.length,
    parsed,
    cached: cachedHits,
    nodes: allNodes.length,
    edges: allEdges.length,
    languages: langCounts,
    durationMs: Date.now() - start,
  };
}

export function printSummary(label: string, r: RunResult): void {
  const cacheRate = r.files > 0 ? ((r.cached / r.files) * 100).toFixed(0) + "%" : "n/a";
  console.log(`[codemap] ${label} complete in ${r.durationMs}ms`);
  console.log(`  files:   ${r.files}  (parsed ${r.parsed}, cached ${r.cached} / ${cacheRate})`);
  console.log(`  nodes:   ${r.nodes}`);
  console.log(`  edges:   ${r.edges}`);
  const langs = Object.entries(r.languages)
    .filter(([, v]) => (v ?? 0) > 0)
    .map(([k, v]) => `${k}=${v}`)
    .join(", ");
  if (langs) console.log(`  langs:   ${langs}`);
}
