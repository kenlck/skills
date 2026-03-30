#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="$HOME/.claude/skills"

usage() {
  cat <<EOF
Usage: skills.sh <command> [args]

Commands:
  new <bundle> <skill-name>   Scaffold a new skill in a bundle
  list                        List all bundles and skills
  link [bundle]               Symlink skills into ~/.claude/skills/
  unlink [bundle]             Remove symlinks from ~/.claude/skills/

Examples:
  ./skills.sh new ken-swe my-skill
  ./skills.sh list
  ./skills.sh link
  ./skills.sh link ken-swe
  ./skills.sh unlink ken-skills
EOF
}

get_bundles() {
  for dir in "$REPO_DIR"/*/; do
    if [[ -f "$dir/.claude-plugin/plugin.json" ]]; then
      basename "$dir"
    fi
  done
}

get_skills() {
  local bundle="$1"
  local skills_path="$REPO_DIR/$bundle/skills"
  if [[ -d "$skills_path" ]]; then
    for dir in "$skills_path"/*/; do
      [[ -f "$dir/SKILL.md" ]] && basename "$dir"
    done
  fi
}

cmd_new() {
  local bundle="${1:-}"
  local skill="${2:-}"

  if [[ -z "$bundle" || -z "$skill" ]]; then
    echo "Usage: skills.sh new <bundle> <skill-name>"
    exit 1
  fi

  local bundle_dir="$REPO_DIR/$bundle"
  if [[ ! -f "$bundle_dir/.claude-plugin/plugin.json" ]]; then
    echo "Error: bundle '$bundle' not found (missing .claude-plugin/plugin.json)"
    exit 1
  fi

  local skill_dir="$bundle_dir/skills/$skill"
  if [[ -d "$skill_dir" ]]; then
    echo "Error: skill '$skill' already exists in '$bundle'"
    exit 1
  fi

  mkdir -p "$skill_dir"
  cat >"$skill_dir/SKILL.md" <<SKILLEOF
---
name: $skill
description: TODO — what this skill does. Use when [specific triggers].
---

# $(echo "$skill" | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2); print}')

## Quick start

\`/$bundle:$skill\`

## Workflow

TODO
SKILLEOF

  echo "Created: $skill_dir/SKILL.md"
}

cmd_list() {
  local bundles
  bundles=$(get_bundles)

  if [[ -z "$bundles" ]]; then
    echo "No bundles found."
    exit 0
  fi

  while IFS= read -r bundle; do
    local plugin_json="$REPO_DIR/$bundle/.claude-plugin/plugin.json"
    local description
    description=$(grep -o '"description": *"[^"]*"' "$plugin_json" 2>/dev/null | sed 's/"description": *"//' | sed 's/"$//' || echo "")
    echo ""
    echo "  $bundle  —  $description"

    local skills
    skills=$(get_skills "$bundle")
    if [[ -n "$skills" ]]; then
      while IFS= read -r skill; do
        local linked=""
        [[ -L "$SKILLS_DIR/$skill" ]] && linked=" (linked)"
        echo "    /$bundle:$skill$linked"
      done <<< "$skills"
    else
      echo "    (no skills)"
    fi
  done <<< "$bundles"
  echo ""
}

cmd_link() {
  local target_bundle="${1:-}"
  mkdir -p "$SKILLS_DIR"

  local bundles
  if [[ -n "$target_bundle" ]]; then
    if [[ ! -d "$REPO_DIR/$target_bundle" ]]; then
      echo "Error: bundle '$target_bundle' not found"
      exit 1
    fi
    bundles="$target_bundle"
  else
    bundles=$(get_bundles)
  fi

  while IFS= read -r bundle; do
    local skills
    skills=$(get_skills "$bundle")
    [[ -z "$skills" ]] && continue

    while IFS= read -r skill; do
      local src="$REPO_DIR/$bundle/skills/$skill"
      local dst="$SKILLS_DIR/$skill"

      if [[ -L "$dst" ]]; then
        echo "  skip   $skill (already linked)"
      elif [[ -e "$dst" ]]; then
        echo "  skip   $skill (exists at $dst, not a symlink — remove manually to link)"
      else
        ln -s "$src" "$dst"
        echo "  linked $skill -> $src"
      fi
    done <<< "$skills"
  done <<< "$bundles"
}

cmd_unlink() {
  local target_bundle="${1:-}"

  local bundles
  if [[ -n "$target_bundle" ]]; then
    if [[ ! -d "$REPO_DIR/$target_bundle" ]]; then
      echo "Error: bundle '$target_bundle' not found"
      exit 1
    fi
    bundles="$target_bundle"
  else
    bundles=$(get_bundles)
  fi

  while IFS= read -r bundle; do
    local skills
    skills=$(get_skills "$bundle")
    [[ -z "$skills" ]] && continue

    while IFS= read -r skill; do
      local dst="$SKILLS_DIR/$skill"
      if [[ -L "$dst" ]]; then
        rm "$dst"
        echo "  unlinked $skill"
      fi
    done <<< "$skills"
  done <<< "$bundles"
}

case "${1:-}" in
  new)    cmd_new "${2:-}" "${3:-}" ;;
  list)   cmd_list ;;
  link)   cmd_link "${2:-}" ;;
  unlink) cmd_unlink "${2:-}" ;;
  *)      usage ;;
esac
