# feature-dev-mini approval hook

The `feature-dev-mini` skill tells a small model to wait for approval before
writing code. A skill is only a suggestion — a stubborn model can still ignore
it. This hook is the **hard floor**: a `PreToolUse` hook that *denies* every
file-editing tool until you create an approval marker. The model literally
cannot edit files before you approve.

It uses the **VS Code Copilot agent hooks** format (Preview), which also reads
Claude-format settings. Same idea works in Claude Code via `settings.json`.

## What's here

| File | Purpose |
|------|---------|
| `require-approval.sh` | Reads the PreToolUse payload, denies edit tools unless `.agent-approved` exists |
| `PreToolUse.json` | Hook config that wires the script to the `PreToolUse` event |

## How it works

1. The model reaches for an edit tool (`editFiles`, `createFile`, `applyPatch`, …).
2. The harness runs `require-approval.sh` first, passing the tool name on stdin.
3. If the tool edits files and `.agent-approved` is **absent**, the script
   returns `permissionDecision: "deny"` and the edit is blocked.
4. Once you approve the Plan and create the marker, edits are allowed.

> Note: VS Code parses but does **not** apply hook `matcher` fields — every
> hook runs on every tool call. That's why the matching lives inside the
> script, not the config.

## Setup (VS Code Copilot)

From your **project root** (the workspace you open in VS Code), copy from your
clone of this repo (`skills.sh link` only symlinks skills, not this `hooks/`
dir, so copy it manually):

```sh
MINI=/path/to/skills/mini       # your clone of this repo
mkdir -p .github/hooks
cp "$MINI/hooks/require-approval.sh" .github/hooks/
cp "$MINI/hooks/PreToolUse.json"     .github/hooks/
chmod +x .github/hooks/require-approval.sh
```

Requires `jq` on your PATH (`brew install jq`).

Reload VS Code (Command Palette → *Developer: Reload Window*) so the hook is
picked up.

### Alternative locations

The same `PreToolUse.json` + script also work if placed in:

- `~/.copilot/hooks/` — applies to **all** workspaces (user-level)
- `.claude/settings.json` — if you also drive this repo with Claude Code

## Daily use

1. Run `/feature-dev-mini <request>` and go through Discovery → Plan.
2. When the Plan looks right, approve it **and unblock edits**:

   ```sh
   touch .agent-approved
   ```

3. The model can now implement. When the feature is done (or you start a new
   one), re-lock:

   ```sh
   rm .agent-approved
   ```

Keep the marker out of version control:

```sh
echo ".agent-approved" >> .gitignore
```

## Adjusting which tools are gated

`require-approval.sh` matches tool names against this regex:

```
edit|create|write|applypatch|patch|insert|replace|multiedit
```

If your agent names its edit tool something else, the deny message prints the
exact `tool_name` it blocked — add that token to the regex. To also gate shell
commands that write files, extend the script to inspect `runTerminalCommand`
payloads.

## Verifying it works

1. With **no** `.agent-approved` present, ask the agent to edit a file directly.
   It should be denied with the gate message.
2. `touch .agent-approved`, ask again — the edit should go through.
