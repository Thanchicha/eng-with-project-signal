// PreToolUse hook: block file tools that point outside this project folder.
// Exit 0 = allow, exit 2 = block (stderr is shown to Claude).
import path from "node:path";
import os from "node:os";

let raw = "";
for await (const chunk of process.stdin) raw += chunk;

let input;
try {
  input = JSON.parse(raw);
} catch {
  process.exit(0);
}

const projectDir = path.resolve(process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd());
const ti = input.tool_input || {};
const targets = [ti.file_path, ti.path, ti.notebook_path].filter((p) => typeof p === "string" && p.trim());

// Claude Code's own state (plans, memory) and the session scratchpad stay usable.
const allowedRoots = [
  projectDir,
  path.join(os.homedir(), ".claude"),
  path.join(os.tmpdir(), "claude"),
];

const norm = (p) => (process.platform === "win32" ? p.toLowerCase() : p);
const isInside = (target, root) => {
  const rel = path.relative(norm(root), norm(target));
  return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
};

for (const t of targets) {
  const abs = path.resolve(projectDir, t);
  if (!allowedRoots.some((root) => isInside(abs, root))) {
    console.error(`blocked: "${t}" is outside the project folder (${projectDir}). See CLAUDE.md §1.`);
    process.exit(2);
  }
}
process.exit(0);
