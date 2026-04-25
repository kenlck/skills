# Anti-AI Prose, Voice, and Content Principles

Companion reference to `SKILL.md`. Read during Step 2 (voice extraction) and Step 6 (self-edit pass).

---

## Voice Token Extraction

When the user has past posts in the repo, voice lives in the text — not in a description of it. Read 2–4 recent posts and extract these tokens before declaring the editorial system:

| Token | What to look for | Example output |
|---|---|---|
| **Register** | Formality level | "Professional but warm; contractions allowed" |
| **Person** | First / second / third | "Mostly second person ('you'); first-person plural ('we') for the practice" |
| **Sentence rhythm** | Average length + variance | "Mostly 12–18 words; occasional sub-7 word punch sentences" |
| **Paragraph length** | Lines per paragraph | "2–4 sentences typical; rarely a one-liner for emphasis" |
| **Hedging frequency** | Confident vs. cautious | "Hedged on clinical claims ('may help', 'in many cases'); confident on practical advice" |
| **Jargon density** | Lay vs. expert | "Defines technical terms on first use; assumes general health literacy" |
| **Signature phrases** | Recurring constructions | "'Here's the thing —', 'In our experience,'" |
| **Taboo words** | Words conspicuously absent | "Never 'cure', 'guaranteed', 'always'" |
| **CTA pattern** | How they close | "Soft invitation to book or message via WhatsApp; never pushy" |
| **H2 phrasing** | Headline style | "Question-style ('Why does my back hurt in the morning?') or imperative ('Stop ignoring this')" |
| **Opening pattern** | First-paragraph move | "Patient anecdote → reframe; or common misconception → correction" |

State observations out loud so the user can validate your reading: "Reading your last 3 posts — voice is second-person, conversational, hedged on clinical claims, opens with patient anecdotes. Confirm or correct before I draft."

If voice tokens conflict across posts (different writers, different eras), ask which is current. Don't average — averages produce lifeless prose.

---

## AI Prose Tells — Full Catalogue

Audit every draft against this list before SEO. Cut, replace, or rewrite. The replacements are starting points, not formulas.

### Empty openers

| Tell | Why it dies | Replace with |
|---|---|---|
| "In today's fast-paced world…" | Means nothing; reader skips | A specific reader scenario or a sharp claim |
| "In the ever-evolving landscape of…" | Pure filler | The actual change you're describing |
| "More than ever before…" | Unverifiable | The actual current condition |
| "Have you ever wondered…" | Patronising | The thing they wondered, stated directly |
| "Picture this:" | Theatre-school cliché | Just describe it |

### Hollow transitions

| Tell | Issue | Fix |
|---|---|---|
| "Moreover" / "Furthermore" / "Additionally" | Glue between points that don't need glue | Delete the word; the sentence usually stands |
| "It's important to note that" | Self-importance signal | Delete the preface; state the fact |
| "It's worth mentioning that" | Same | Same |
| "As we've seen" / "As mentioned" | Reader has read it; don't re-flag | Delete |

### Vapor verbs and nouns

Cut on sight unless the literal meaning is intended:

- **Vapor verbs**: delve, navigate (metaphorical), unlock, leverage, harness, foster, cultivate, embark, pivot, ideate, synergize
- **Vapor nouns**: tapestry, landscape, journey, realm, testament, symphony, ecosystem (when used loosely), paradigm, framework (when used loosely)
- **Vapor adjectives**: seamless, cutting-edge, robust, holistic, transformative, game-changing, world-class

If you find yourself reaching for one, the underlying claim is probably weak. Sharpen the claim instead.

### Forced tricolons

Three-item parallel lists where two items would do, or where the third is padding:

- ❌ "efficient, effective, and impactful"
- ❌ "fast, reliable, and scalable"
- ❌ "clear, concise, and compelling"

If the third item is just a synonym of the first two, cut it. If it adds something, give it its own sentence.

### Em-dash as personality

Em-dashes are valid for genuine parenthetical asides. They become an AI tell when:

- Used in every paragraph
- Used to dramatise sentences that don't need drama
- Used as a comma substitute

Audit pattern: count em-dashes. If more than 1 per ~250 words, cut some. Replace with a comma, full stop, or rewrite to remove the aside entirely.

### Meaningless hedges and intensifiers

| Tell | Issue |
|---|---|
| "truly", "really", "deeply", "incredibly" as intensifiers | Signal the writer doesn't trust the underlying claim |
| "various", "numerous", "myriad" | Vague where a number or "several" would do |
| "can be" used to dodge specificity | "Back pain can be complex" — every condition can be complex |

### Closing platitudes

- ❌ "Remember, the journey is just as important as the destination"
- ❌ "Ultimately, the choice is yours"
- ❌ "At the end of the day…"
- ❌ "The possibilities are endless"

Close with a concrete next step, a sharp summary of the core claim, or a deliberate question. Not a fortune-cookie sign-off.

### Fake balance

"While some argue X, others argue Y" used as a way to avoid taking a position. A senior writer takes the position the editorial system declared in Step 3 — or flags genuine uncertainty, with reasons. False both-sides-ism is forgettable.

### AI listicle bloat

Symptom: 7+ H2s, each with a one-sentence body. Reads like an outline pretending to be a post. Either expand each section to earn its heading or collapse them into 3–5 substantive H2s.

### The "would a human write this" test

Read each sentence and ask: **would a human writer, with 20 minutes to spare and a reader they actually care about, write this exact sentence?** If no, cut or rewrite.

---

## Placeholder Philosophy

When you lack a real stat, quote, source, or customer story, a flagged placeholder is more professional than a fabrication. The editor can fill the placeholder before publish; the editor cannot un-publish a fabricated citation.

| Missing | Placeholder format | Why |
|---|---|---|
| Stat | `[stat: need source — "X% of adults over 50 report Y"]` | Editor knows what stat is needed and roughly what shape |
| Quote | `[expert quote needed: from whom, on what point?]` | Specifies the slot, not just "quote here" |
| Study citation | `[ref: PubMed query "lumbar disc conservative"]` | Suggests a search, not invents a paper |
| Customer / patient story | `[ask user for real story]` or cut the example | Never invent a person |
| Internal link | `[internal link: related post on X]` | Editor adds when target exists |
| Image | `[image: physiotherapist guiding balance exercise]` | Describes the image needed |
| Date / version-specific fact | `[verify as of YYYY-MM]` | Flags time-sensitivity |

A placeholder tells the editor "real material needed here." A fabrication tells the editor "I cut corners — now we have a correction to publish next week."

### Hard rule: never fabricate

- No invented studies, even plausibly named ones
- No invented patients or customers, even composite ones (unless the post explicitly says "composite scenario")
- No invented stats, even round-number guesses
- No invented quotes, even attributed to "an expert"
- No invented historical events, dates, or attributions

If a sentence requires a fabricated element to work, rewrite the sentence — don't invent the element.

---

## Content Principles

### Every paragraph earns its place

Test: delete the paragraph. Does the post lose anything the reader needed? If no, the paragraph wasn't earning its place. Delete it for real.

This applies especially to:
- "Introduction" paragraphs that restate the title
- "Conclusion" paragraphs that summarise what was just read
- Transition paragraphs that announce what's coming next ("Now let's look at…")
- Definition paragraphs for terms the audience already knows

### Don't add sections unilaterally

If the draft seems to want more, ask the manager. They know publishing cadence, audience patience, and SEO depth needs better than you do. A 700-word post that's tight beats a 1400-word post that's padded.

### Less is more

Length is not quality. A sharp 700-word post can outperform a 1500-word post on the same topic if the 700 are denser. Targets are guides, not goals — if the angle exhausts itself at 600, stop.

### Opinions, not reports

A senior writer has a take. The editorial system declared an angle in Step 3 — commit to it. Hedging every claim is not balance, it's forgettability.

Distinguish:
- **Defensible opinion** ("Most low-back pain doesn't need an MRI in the first 6 weeks") — commit
- **Probabilistic claim** ("This treatment helps most patients") — hedge honestly
- **Speculative claim** ("This might be the future of physiotherapy") — flag clearly or cut

### When the post feels thin, it's an angle problem

Symptom: draft is short, padding tempts you, sections feel generic. Cause: the angle (Step 3) wasn't sharp enough — you're writing about the topic, not arguing a take. Fix by sharpening the angle, not by adding words.

### Read it aloud

Final pass: read the draft aloud. Where you stumble, the prose is wrong. Where you skim, the paragraph is filler. Where you nod, the sentence works.
