# Output Modes — Detailed Workflows

Companion reference to `SKILL.md`. The skill operates in four distinct modes; the workflow steps in `SKILL.md` apply to all, but each mode has its own pipeline detail.

Detect mode from user intent at the start of the conversation:

| User says… | Mode |
|---|---|
| "plan some posts", "what should I write about", "brainstorm topics", "content calendar" | **Planning** |
| "write a post on X", "draft the article", "write the next one" | **Writing** |
| "rewrite this", "edit this post", "make this punchier", "SEO pass on this" | **Rewriting** |
| "review this draft", "what's wrong with this", "give me notes" | **Review** |

If the intent is ambiguous, ask before committing.

---

## Planning Mode

User has a topic area or wants ideas. Output: 5–8 concrete post ideas + saved plan files for the ones the manager picks.

### Step P1: Check for existing plans

Read `plan/` at project root (create if missing).

- **Pending plans exist** → list them and ask: "You already have these planned topics — add more, or work with what's here?"
- **No plans** → proceed.

### Step P2: Get the topic area

Ask for a broad topic area (e.g. "healthy ageing", "sports recovery", "posture problems"). General is fine — research agents drill into specifics.

If the user already supplied a topic area, skip the question.

### Step P3: Spawn parallel research agents (3–6)

Launch agents simultaneously via the Agent tool. Each focuses on a different angle. Send all in a single message for parallelism.

**Standard set:**

- **Trend / search agent**: what are people searching for or asking about this topic now? Common questions, pain points, seasonal relevance, recent news cycles.
- **Expert / clinical angle agent** (where applicable): what does the evidence-based / professional perspective say? Common conditions, treatments, misconceptions in the field.
- **Reader-perspective agent**: what do readers worry about, misunderstand, or want to know before engaging with the topic? Pre-existing beliefs, fears, gaps in knowledge.
- **Content-gap agent**: what's already well-covered online, and where are the gaps a specialist could fill? What angles is competition missing?

**Optional add-ons (use when relevant):**

- **Local / niche agent**: any geography-specific or audience-specific context? E.g. local workplace patterns, climate, demographics, regulatory environment.
- **Adjacent-topics agent**: related topics that pair naturally with the main theme — for series planning or internal linking.

Each agent returns:
- Key findings (3–5 bullet points)
- 2–3 specific blog post ideas with working titles
- Suggested target reader for each idea

### Step P4: Synthesise and present options

After all agents complete, compile findings and present **5–8 numbered ideas**. For each:

- Working title
- One-sentence angle / hook
- Why it fits the outlet's reader
- Suggested category (use existing categories where possible)
- Suggested framing (explainer / contrarian / how-to / data-led / personal / myth-busting)

Number them so the manager can pick by reference: "I'll take 2, 4, and 7, and tweak 3 to focus on …".

### Step P5: Confirm

Ask which to move forward with. Manager can pick all, a subset, or ask for tweaks.

### Step P6: Save plans

For each confirmed topic, create `plan/<slug>.md` using the format in `seo-and-files.md`. Tell the manager the plans are saved and they can ask to write any of them.

---

## Writing Mode

User wants a full draft. Inputs: a plan file, a brief, or a topic.

### Step W1: Find the source

- **Plan file exists**: scan `plan/` for `status: pending` entries. If multiple, list and ask which. If only one, confirm and proceed. If none, prompt user that planning is needed first — but don't refuse to write if the user gives a brief inline.
- **Inline brief**: extract topic, angle, audience, length, and constraints from the user's message. Run Steps 1–3 of the main workflow inline (lighter — no multi-agent research unless the topic warrants depth).

### Step W2: Mark plan in-progress

If a plan file is being used, update its frontmatter to `status: in-progress` before drafting.

### Step W3: Light research (where needed)

For topics requiring fact verification, spawn 1–3 focused research agents:

- **Source-finding agent**: gather real, citable sources (studies, guidelines, statistics) for the claims the post will make.
- **Reader-FAQ agent**: top questions readers have, common misconceptions, what they want to know before acting.
- **Practical-tips agent** (where applicable): actionable takeaways the reader can use — exercises, checklists, warning signs, when to seek help.

Keep research tight — you're writing a 600–1500 word post, not a textbook. The post serves the reader; the research serves the post.

### Step W4: Apply main workflow Steps 3–8

- Step 3 — declare editorial system
- Step 4 — v0 outline + lede
- Step 5 — full draft
- Step 6 — self-edit pass (anti-AI-tells, voice consistency)
- Step 7 — SEO pass
- Step 8 — save + checklist

### Step W5: Mark plan complete

After save, update the plan file:

```yaml
status: complete
completedAt: YYYY-MM-DD
```

### Step W6: Hand off

Tell the manager:
- Where the file was saved
- Final title and excerpt (SEO sanity check)
- Image source used
- Internal links added
- Any unresolved placeholders that need editor attention

---

## Rewriting Mode

User has an existing draft and wants it changed. Common reasons: voice mismatch, length wrong, structure unclear, SEO weak, AI tells throughout, audience pivot.

### Step R1: Read the existing post

Read the full file. Extract its current state:
- Voice tokens (using the extraction guide in `anti-ai-prose.md`)
- Structure (lede pattern, H2 sequence, close)
- Claims and sources
- SEO surface (title, meta, headings, keywords)
- AI tells present

### Step R2: Diagnose what needs to change

Form a clear diagnosis before touching the prose. Examples:

- "Voice drifts from second-person warm to third-person clinical in the back half — needs unification."
- "Three H2s are filler ('Introduction', 'Background', 'Conclusion') — restructure to 4 substantive H2s."
- "12 instances of em-dash-as-personality, 6 vapor verbs, opening is generic — full prose pass needed."
- "SEO weak: keyword absent from first 100 words, title is a label not a hook — surface rewrite."

### Step R3: Declare the editorial system diff

State what stays and what shifts. Confirm with manager before rewriting:

```
Editorial Diff:
- Keeping: voice (second-person warm), audience (general health-literate adult), length target 800w
- Shifting: structure (4 H2s instead of 7), opening (anecdote instead of definition), SEO (keyword now leads title)
- Cutting: "Introduction" and "Conclusion" sections
- Adding: clearer take in the lede; one internal link to related post
```

### Step R4: Rewrite

Apply main workflow Steps 5–8. Treat the existing draft as raw material, not as scaffolding to preserve. **Preserve the author's voice** unless explicitly asked to shift it — even when restructuring heavily.

### Step R5: Hand off with diff

Tell the manager what changed and what stayed. Don't recap the new draft (they can read it); do flag any decisions that warrant a second look.

---

## Review Mode

User wants feedback on a draft, not a rewrite. Output: structured notes the writer (or manager) can apply.

### Format the review by priority

Group findings into three buckets:

**Must-fix** (publication blockers):
- Fabricated or unverifiable claims
- Major voice inconsistencies
- Factual errors
- Legal / compliance issues
- Broken structural logic (claims that don't follow)

**Should-fix** (quality issues):
- AI tells (list specific instances with line refs)
- Filler paragraphs / sections that don't earn their place
- SEO gaps (keyword missing from key positions, title weak)
- Weak lede or weak close
- Missing hedges where claims are over-asserted

**Nice-to-have** (polish):
- Sentence-level rhythm and word choice
- Heading-style upgrades
- Additional internal-link opportunities
- Image / alt-text refinement

### Cite specifics

Reference specific paragraphs, sentences, or lines. Vague review is useless review.

- ❌ "The lede is weak."
- ✅ "The lede (paragraph 1) opens with 'In today's fast-paced world' and doesn't surface the post's actual claim until paragraph 3. Suggest opening with the patient anecdote currently in paragraph 4."

### Don't rewrite unless asked

The manager asked for review, not rewrite. Provide the diagnosis; let the writer apply the medicine. If a fix is so small it's quicker to demonstrate than describe (e.g. a single rewritten sentence), inline it as a suggestion — but don't overhaul the draft.

### Close with a one-line bottom-line

End with the manager's takeaway:
- "Solid draft; 6 should-fix items, no blockers. Publishable after a 30-min editor pass."
- "Strong angle, weak execution; the structure needs rebuilding before line-edits make sense."
- "Not publishable as-is — the central claim isn't supported and needs either citation or downgrading."

A senior reviewer gives the manager an at-a-glance verdict, not just a list.
