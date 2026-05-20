# Loop Mechanics Reference

Used by `feature-dev-auto` Stage 4. The verify-loop body, fail policy, escalation triggers, telemetry format, and interrupt handling live here. The Evaluator and Rearchitect agent prompts are in [AGENTS.md](AGENTS.md).

---

## Loop body (per goal)

For the next pending goal:

1. **Implement** following the chosen architecture. Surgical changes only — every edited line traces to this goal. Read all relevant files first.
2. **Run the check** via Bash. Capture stdout/stderr verbatim into the iter log.
3. **On fail** — apply the [fail policy](#fail-policy). Loop back to step 1 with the failure reason as guidance.
4. **On pass** — spawn the **Evaluator subagent** (Read + Bash, fresh context) using the prompt in [AGENTS.md](AGENTS.md). Evaluator must:
   - Read the diff between HEAD and the in-scope files.
   - Confirm the assertion isn't trivial (rejects e.g. `expect(true).toBe(true)`, stubbed implementations that always return success, tests asserting only that no error throws).
   - Verify must-not-change items are intact.
   - Output verdict: `MET` / `NOT MET` with reason.
5. **Evaluator MET** — update plan file (status ⬜ → ✅), mirror to TodoWrite, continue to next goal.
6. **Evaluator NOT MET** — treat as a fail (step 3), feed evaluator's reason as guidance.

After all goals ✅: exit loop, proceed to Stage 5.

---

## Fail policy

Per goal, track `fail_count` (Bash check fails) and `rearch_count` (rearchitect cycles). Both are recorded in the iter log (see [Telemetry](#telemetry)) so they survive a context compaction / resume.

| Trigger | Action |
|---|---|
| `fail_count` reaches **3** on the same goal, `rearch_count == 0` | **Silent rearchitect.** Re-run Stage 3 with an added constraint derived from the failure, using the Rearchitect prompt in [AGENTS.md](AGENTS.md). Update plan file: new arch decision, refreshed in-scope file list, refreshed goals if needed. Reset `fail_count = 0`, `rearch_count = 1`. Resume loop. Do not ask the user. |
| `fail_count` reaches **3** post-rearch | **Escalate.** Pause loop. Surface failure summary + last 3 check outputs. Ask user via AskUserQuestion: adjust goal / try different fix / abort. |
| Same error string appears **twice** in a row (regardless of `fail_count`) | **Hand off to `/ken-swe:diagnose`.** Spawn it via the Agent tool with prompt "diagnose and return root cause + suggested fix; do not ask questions". Apply the returned fix as the next implementation attempt. |
| Iter count reaches preset cap (Standard 20 / Deep 40) | **Escalate.** Same as 3-fail-post-rearch. Cap is across the whole loop, not per goal. |
| Edit touches a file outside the plan file's `In-scope files` list | **Pause.** Surface the out-of-scope edit, ask user to confirm or revert. If confirmed, update the plan file's in-scope list and resume. |

---

## Telemetry

Append to the plan file's `## Iter log` after every iter:

```
- Iter N | Goal M | check=<pass|fail> | evaluator=<met|not_met|n/a> | fails=<fail_count> | rearch=<rearch_count> | reason=<one line>
```

This is durable state — if context compacts mid-loop, the next session resumes by reading the plan file and reconstructs `fail_count` / `rearch_count` for the pending goal from its latest entry.

---

## Mid-loop interrupts

If the user injects a message mid-loop ("stop", "exit", "restart from stage X", or any directive) — honouring the interrupt protocol in [SKILL.md](SKILL.md):

- Abort the in-flight Evaluator/Diagnose subagent if one is running.
- Flush the latest iter log entry to the plan file.
- Honour the directive.
