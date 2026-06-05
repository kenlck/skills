#!/usr/bin/env bash
# PreToolUse hook for feature-dev-mini.
# Denies file-editing tools until an approval marker exists in the workspace.
# The user creates the marker (`touch .agent-approved`) after approving the Plan,
# which structurally prevents a small model from coding before approval.
#
# Reads a PreToolUse JSON payload on stdin, writes a permissionDecision on stdout.
# Requires: jq

set -euo pipefail

INPUT="$(cat)"

TOOL_NAME="$(printf '%s' "$INPUT" | jq -r '.tool_name // empty')"
CWD="$(printf '%s' "$INPUT" | jq -r '.cwd // empty')"
[ -n "$CWD" ] || CWD="$PWD"

MARKER="$CWD/.agent-approved"

# Tools that modify files. Matchers in the hook config are NOT applied by the
# harness, so we match the tool name here. Adjust this regex if your agent uses
# different tool names (tip: the denied tool name is printed in the reason, and
# also appears in the transcript).
EDIT_TOOLS_RE='edit|create|write|applypatch|patch|insert|replace|multiedit'

allow() {
  printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}\n'
  exit 0
}

deny() {
  local reason="$1"
  # jq -Rs safely JSON-encodes the reason string.
  local r
  r="$(printf '%s' "$reason" | jq -Rs '.')"
  printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":%s}}\n' "$r"
  exit 0
}

# Lowercase for matching.
TOOL_LC="$(printf '%s' "$TOOL_NAME" | tr '[:upper:]' '[:lower:]')"

if printf '%s' "$TOOL_LC" | grep -qE "$EDIT_TOOLS_RE"; then
  if [ ! -f "$MARKER" ]; then
    deny "feature-dev-mini gate: '$TOOL_NAME' blocked. The Plan has not been approved. Approve the Plan, then run 'touch $MARKER' to unblock file edits."
  fi
fi

allow
