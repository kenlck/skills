# Anti-AI Prose, Voice, and Content Principles

Companion reference to `SKILL.md`. Read during Step 2 (voice extraction) and Step 6 (self-edit pass).

The pattern catalogue below is grounded in Wikipedia's "Signs of AI writing" guide (WikiProject AI Cleanup) and observation of post-2023 LLM output. The "Personality and Soul" section is what separates clean-but-soulless prose from prose that actually reads human.

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
| **H2 phrasing** | Headline style | "Sentence-case, question-style or imperative" |
| **Opening pattern** | First-paragraph move | "Patient anecdote → reframe; or common misconception → correction" |

State observations out loud so the user can validate your reading: "Reading your last 3 posts — voice is second-person, conversational, hedged on clinical claims, opens with patient anecdotes. Confirm or correct before I draft."

If voice tokens conflict across posts (different writers, different eras), ask which is current. Don't average — averages produce lifeless prose.

---

## Personality and Soul

> **Avoiding AI patterns is only half the job.** Sterile, voiceless writing is just as obvious as AI slop. Good writing has a human behind it.

A draft can pass every pattern audit below and still read AI-shaped. The reason: clean prose without personality. The reader can tell.

### Signs of soulless writing (even if technically "clean")

- Every sentence is the same length and structure.
- No opinions, just neutral reporting.
- No acknowledgment of uncertainty or mixed feelings.
- No first-person perspective even when it would fit.
- No humor, no edge, no specificity of feeling.
- Reads like a press release or Wikipedia article.

### How to add voice

**Have opinions.** Don't just report — react. The editorial system in Step 3 declared an angle. Commit to it. "I genuinely don't know how to feel about this one" beats neutrally listing pros and cons.

**Vary rhythm aggressively.** Short punchy sentences. Then longer ones that take their time getting where they're going. Mix it up. If five sentences in a row are ~20 words, break one to 6, stretch one to 30. Variance is the most reliable human signal.

**Acknowledge complexity.** Real humans have mixed feelings. "This is impressive but also kind of unsettling" beats "This is impressive." Hedge for honesty, not for cover.

**Use first-person where the brand voice allows.** "I keep coming back to…" or "Here's what gets me…" signals a real person thinking. Not unprofessional — honest. Skip if the brand voice is strictly third-person.

**Let some mess in.** Perfect parallel structure feels algorithmic. Tangents, asides, half-formed thoughts read human. A sentence that trails off into a parenthetical is more alive than three perfectly balanced clauses.

**Be specific about feelings.** Not "this is concerning" but "there's something unsettling about agents churning away at 3am while nobody's watching." Specificity is anti-AI by construction — LLM defaults toward the most statistically likely abstraction.

### Before / after — clean but soulless → has a pulse

**Before** (technically AI-tell-free, still obviously AI):
> The experiment produced interesting results. The agents generated 3 million lines of code. Some developers were impressed while others were skeptical. The implications remain unclear.

**After** (varied rhythm + opinion + specificity):
> I genuinely don't know how to feel about this one. 3 million lines of code, generated while the humans presumably slept. Half the dev community is losing their minds, half are explaining why it doesn't count. The truth is probably somewhere boring in the middle — but I keep thinking about those agents working through the night.

The "after" has rhythm (short → long → short), an opinion, specificity ("3am", "presumably slept", "boring"), and an honest hedge ("probably somewhere boring in the middle"). None of those are tricks; all are senior-writer moves.

---

## The Two-Pass Audit Loop

This is the single most important step in humanization. Run it after the pattern audit and the soul check.

### Pass 1: First-pass draft, cleaned

After Stage 6a (pattern audit) and Stage 6b (soul check), you have a draft. It looks reasonable.

### Pass 2: The explicit AI-detection question

Ask yourself, out loud or in writing: **"What makes this draft so obviously AI-generated?"**

Answer briefly with the remaining tells. Common residual tells even after a clean pass:

- Rhythm too tidy — clean contrasts, evenly-paced paragraphs, no surprises
- Closing reads slogan-y rather than like a person talking
- Names or stats read placeholder-ish — "Mira, an engineer at a fintech startup" — even if real, the construction is suspicious
- Each paragraph hits exactly one point with exactly one example
- Transitions between paragraphs are too smooth — humans have rougher seams
- The opinions stated are the safest possible opinions
- Three-paragraph structure within a section: claim → example → reframe, repeated

### Pass 3: Revise to fix what you flagged

Now revise. Break the rhythm. Roughen the transitions. Make the opinions sharper or more specific. Cut the example that feels placeholder-y or replace with something concrete.

The question itself is the leverage. Asking "what makes this AI?" forces the senior-editor critical eye that the writer's eye lacks. Skipping the loop leaves a draft that's clean but flat.

---

## AI Prose Tells — Full Catalogue

Audit every draft against this list during Stage 6a. Cut, replace, or rewrite. Replacements are starting points, not formulas.

### Significance inflation (legacy / broader trends)

**Watch words**: stands as, serves as, is a testament, pivotal moment, vital role, key/crucial/significant role, underscores its importance, reflects broader, symbolizing its enduring/lasting/ongoing, contributing to the, setting the stage for, marking a shift, key turning point, evolving landscape, focal point, indelible mark, deeply rooted.

**Why it dies**: LLMs puff up importance by claiming arbitrary aspects represent or contribute to a broader topic. Reads like a generic encyclopedia entry.

**Before**: "The Statistical Institute of Catalonia was officially established in 1989, marking a pivotal moment in the evolution of regional statistics in Spain."

**After**: "The Statistical Institute of Catalonia was established in 1989 to publish regional statistics independently from Spain's national office."

### Notability / media-coverage padding

**Watch words**: independent coverage, featured in [list of outlets], leading expert, active social media presence, widely cited.

**Before**: "Her views have been cited in The New York Times, BBC, Financial Times, and The Hindu."

**After**: "In a 2024 New York Times interview, she argued AI regulation should focus on outcomes, not methods."

### Superficial -ing analyses

**Watch words**: highlighting, underscoring, emphasizing, ensuring, reflecting, symbolizing, contributing to, fostering, cultivating, encompassing, showcasing.

**Why it dies**: AI tacks present-participle phrases onto sentences for fake depth.

**Before**: "The temple's blue, green, and gold palette resonates with the region's natural beauty, symbolizing Texas bluebonnets, the Gulf of Mexico, and diverse Texan landscapes, reflecting the community's deep connection to the land."

**After**: "The temple uses blue, green, and gold. The architect chose them to reference local bluebonnets and the Gulf coast."

### Promotional / advertisement language

**Watch words**: boasts, vibrant, rich (figurative), profound, enhancing, showcasing, exemplifies, commitment to, natural beauty, nestled, in the heart of, groundbreaking (figurative), renowned, breathtaking, must-visit, stunning, world-class.

**Before**: "Nestled within the breathtaking region, the town stands as a vibrant hub with rich cultural heritage and stunning natural beauty."

**After**: "The town is in the Gonder region of Ethiopia, known for its weekly market and 18th-century church."

### Vague attributions / weasel words

**Watch words**: industry reports, observers have cited, experts argue, some critics argue, several sources, many believe, it is widely thought.

**Before**: "Experts believe it plays a crucial role in the regional ecosystem."

**After**: "The river supports several endemic fish species, according to a 2019 Chinese Academy of Sciences survey."

### "Challenges and Future Prospects" templates

**Watch words**: Despite its …, faces several challenges, Despite these challenges, Challenges and Legacy, Future Outlook, continues to thrive, ongoing initiatives.

**Why it dies**: AI-generated articles love a formulaic "challenges + outlook" closer.

**Before**: "Despite its industrial prosperity, the area faces challenges typical of urban areas, including traffic and water scarcity. Despite these challenges, ongoing initiatives ensure it continues to thrive."

**After**: "Traffic congestion increased after 2015 when three new IT parks opened. The municipal council began a stormwater drainage project in 2022 to address recurring floods."

### Overused AI vocabulary

**High-frequency**: additionally, align with, crucial, delve, emphasizing, enduring, enhance, fostering, garner, highlight (verb), interplay, intricate, intricacies, key (adjective overuse), landscape (abstract), pivotal, showcase, tapestry, testament, underscore, valuable, vibrant, leverage, harness, navigate (figurative), unlock, ideate, embark, pivot, ecosystem (figurative), framework (figurative), seamless, holistic, transformative, game-changing.

These appear far more frequently in post-2023 text and tend to co-occur. Cut on sight unless the literal meaning is intended.

### Copula avoidance ("serves as" / "stands as")

**Watch words**: serves as, stands as, functions as, marks, represents [a], boasts, features, offers.

**Why it dies**: LLMs replace simple "is"/"has" with elaborate constructions to sound formal. The result: bloated, hollow.

**Before**: "Gallery 825 serves as LAAA's exhibition space. The gallery features four spaces and boasts over 3,000 square feet."

**After**: "Gallery 825 is LAAA's exhibition space. It has four rooms totaling 3,000 square feet."

When in doubt: can the sentence work with "is" or "has"? Use them.

### Negative parallelisms

**Pattern**: "Not only X but Y", "It's not just about X; it's about Y", "It's not merely X, it's Y."

**Why it dies**: Overused. Performs depth without delivering.

**Before**: "It's not just about the beat riding under the vocals; it's part of the aggression and atmosphere. It's not merely a song, it's a statement."

**After**: "The heavy beat adds to the aggressive tone."

### Forced rule-of-three

**Pattern**: three parallel items where two would do, or where the third is filler.

**Examples**:
- ❌ "efficient, effective, and impactful"
- ❌ "fast, reliable, and scalable"
- ❌ "innovation, inspiration, and industry insights"

If the third item is a near-synonym, cut it. If it adds something distinct, give it its own sentence.

### Elegant variation (synonym cycling)

**Pattern**: the same referent renamed every sentence to "avoid repetition".

**Before**: "The protagonist faces challenges. The main character must overcome obstacles. The central figure eventually triumphs. The hero returns home."

**After**: "The protagonist faces many challenges, but eventually triumphs and returns home."

Repetition of the same noun is fine. Cycling through synonyms is an AI tic.

### False ranges

**Pattern**: "from X to Y" where X and Y aren't on a meaningful scale.

**Before**: "Our journey through the universe takes us from the singularity of the Big Bang to the grand cosmic web, from the birth and death of stars to the enigmatic dance of dark matter."

**After**: "The book covers the Big Bang, star formation, and current theories about dark matter."

### Em-dash overuse

Em-dashes are valid for genuine parenthetical asides. They become an AI tell when:

- Used in every paragraph
- Used to dramatise sentences that don't need drama
- Used as a comma substitute
- Stacked ("phrase — clause — clause") for forced rhythm

**Audit pattern**: count em-dashes. If more than 1 per ~250 words, cut some. Replace with comma, full stop, or rewrite.

**Before**: "The term is primarily promoted by Dutch institutions — not by the people themselves. You don't say 'Netherlands, Europe' as an address — yet this mislabeling continues — even in official documents."

**After**: "The term is primarily promoted by Dutch institutions, not by the people themselves. You don't say 'Netherlands, Europe' as an address, yet this mislabeling continues in official documents."

### Excessive boldface

**Pattern**: bolding phrases mechanically, often technical-term first-mentions or acronyms.

**Before**: "It blends **OKRs (Objectives and Key Results)**, **KPIs (Key Performance Indicators)**, and **Balanced Scorecard (BSC)**."

**After**: "It blends OKRs, KPIs, and the Balanced Scorecard."

Use bold for genuine emphasis where the reader's eye should land. Not as decoration.

### Inline-header vertical lists

**Pattern**: bulleted lists where every item starts with a bolded header followed by a colon and a generic explanation.

**Before**:
> - **User Experience:** The user experience has been significantly improved with a new interface.
> - **Performance:** Performance has been enhanced through optimized algorithms.
> - **Security:** Security has been strengthened with end-to-end encryption.

**After**: "The update improves the interface, speeds up load times through optimised algorithms, and adds end-to-end encryption."

If a list is genuinely warranted (3+ items, each substantive), keep it. But the bolded-label-colon-restatement pattern is a giveaway.

### Title case in headings

AI defaults to capitalising main words in headings. Most modern blogs use sentence case.

- ❌ "## Strategic Negotiations And Global Partnerships"
- ✅ "## Strategic negotiations and global partnerships"

Match the project's existing convention. If sentence case is the convention, enforce it.

### Emojis in headings or bullets

Decorative emojis (🚀 💡 ✅) on headings or bullets are an AI tell. Cut unless the brand voice explicitly uses them (some consumer brands do).

### Curly quotation marks

ChatGPT outputs curly quotes (" ") instead of straight (" "). Use straight quotes unless the project's existing posts use curly. Find/replace pass before save.

### Knowledge-cutoff disclaimers

**Watch words**: as of [date], up to my last training update, while specific details are limited, based on available information, in the absence of more current data.

These leak the AI's training-data-anxiety into the prose. Cut and either find the real fact or rephrase to not need it.

**Before**: "While specific details about the company's founding are not extensively documented in readily available sources, it appears to have been established sometime in the 1990s."

**After**: "The company was founded in 1994, according to its registration documents." (Or, if the real date is unknown: "The company's founding date is unclear.")

### Sycophantic / servile tone

**Watch words**: Great question!, Of course!, Certainly!, You're absolutely right!, I hope this helps, Let me know.

These are chatbot-correspondence artifacts that get pasted into content. Strip them entirely.

### Filler phrases

| Bloat | Tight |
|---|---|
| "In order to achieve this goal" | "To achieve this" |
| "Due to the fact that" | "Because" |
| "At this point in time" | "Now" |
| "In the event that you need help" | "If you need help" |
| "The system has the ability to process" | "The system can process" |
| "It is important to note that the data shows" | "The data shows" |

### Excessive hedging

**Before**: "It could potentially possibly be argued that the policy might have some effect on outcomes."

**After**: "The policy may affect outcomes."

Hedge for honest uncertainty, not for cover.

### Generic positive conclusions

**Watch words**: the future looks bright, exciting times lie ahead, journey toward excellence, possibilities are endless, step in the right direction, a journey worth taking.

**Before**: "The future looks bright. Exciting times lie ahead as they continue their journey toward excellence."

**After**: "The company plans to open two more locations next year." (Or: cut entirely. Not every post needs a future-tense capper.)

### Empty openers

| Tell | Replace with |
|---|---|
| "In today's fast-paced world…" | A specific reader scenario or sharp claim |
| "In the ever-evolving landscape of…" | The actual change you're describing |
| "More than ever before…" | The actual current condition |
| "Have you ever wondered…" | The thing they wondered, stated directly |
| "Picture this:" | Just describe it |

### Hollow transitions

| Tell | Fix |
|---|---|
| "Moreover" / "Furthermore" / "Additionally" | Delete the word; the sentence usually stands |
| "It's important to note that" | Delete the preface; state the fact |
| "It's worth mentioning that" | Same |
| "As we've seen" / "As mentioned" | Delete (reader has read it) |

### Closing platitudes

- ❌ "Remember, the journey is just as important as the destination"
- ❌ "Ultimately, the choice is yours"
- ❌ "At the end of the day…"
- ❌ "The possibilities are endless"

Close with a concrete next step, sharp summary, or deliberate question. Not a fortune cookie.

### Fake balance

"While some argue X, others argue Y" used to dodge a position. A senior writer takes the position the editorial system declared, or flags genuine uncertainty with reasons. False both-sides-ism is forgettable.

### Meaningless intensifiers

"truly", "really", "deeply", "incredibly" as boosters. Signal the writer doesn't trust the underlying claim. Cut and let the claim stand on its own. If the claim can't stand on its own, the problem isn't the booster.

### AI listicle bloat

Symptom: 7+ H2s, each with a one-sentence body. Reads like an outline pretending to be a post. Either expand each section to earn its heading or collapse to 3–5 substantive H2s.

---

## The "Would a Human Write This" Test

Final pass: read each sentence aloud and ask: **would a human writer, with 20 minutes to spare and a reader they actually care about, write this exact sentence?** If no, cut or rewrite.

This works because LLMs default to the most statistically average phrasing. Humans, especially senior writers with limited time, default to specificity, opinion, and rhythm — none of which are statistically average.

---

## Placeholder Philosophy

When you lack a real stat, quote, source, or customer story, a flagged placeholder is more professional than a fabrication. The editor can fill the placeholder before publish; the editor cannot un-publish a fabricated citation.

| Missing | Placeholder format |
|---|---|
| Stat | `[stat: need source — "X% of adults over 50 report Y"]` |
| Quote | `[expert quote needed: from whom, on what point?]` |
| Study citation | `[ref: PubMed query "lumbar disc conservative"]` |
| Customer / patient story | `[ask user for real story]` or cut the example |
| Internal link | `[internal link: related post on X]` |
| Image | `[image: physiotherapist guiding balance exercise]` |
| Date / version-specific | `[verify as of YYYY-MM]` |

### Hard rule: never fabricate

- No invented studies, even plausibly named
- No invented patients or customers, even composite (unless the post explicitly says "composite scenario")
- No invented stats, even round-number guesses
- No invented quotes, even attributed to "an expert"
- No invented dates, attributions, or historical events

If a sentence requires a fabricated element to work, rewrite the sentence — don't invent the element.

---

## Content Principles

### Every paragraph earns its place

Test: delete the paragraph. Does the post lose anything the reader needed? If no, the paragraph wasn't earning its place. Delete it for real.

Applies especially to:
- "Introduction" paragraphs that restate the title
- "Conclusion" paragraphs that summarise what was just read
- Transition paragraphs that announce what's coming ("Now let's look at…")
- Definition paragraphs for terms the audience already knows

### Don't add sections unilaterally

If the draft seems to want more, ask the manager. They know publishing cadence and audience patience better. A 700-word post that's tight beats a 1400-word post that's padded.

### Less is more

Length is not quality. A sharp 700-word post can outperform a 1500-word post on the same topic if the 700 are denser. Targets are guides, not goals.

### Opinions, not reports

A senior writer has a take. The editorial system declared an angle in Step 3 — commit to it. Hedging every claim is not balance, it's forgettability.

Distinguish:
- **Defensible opinion** ("Most low-back pain doesn't need an MRI in the first 6 weeks") — commit
- **Probabilistic claim** ("This treatment helps most patients") — hedge honestly
- **Speculative claim** ("This might be the future of physiotherapy") — flag clearly or cut

### When the post feels thin, it's an angle problem

Symptom: draft is short, padding tempts you, sections feel generic. Cause: the angle (Step 3) wasn't sharp enough — you're writing about the topic, not arguing a take. Fix by sharpening the angle, not by adding words.

### Read it aloud

Where you stumble, the prose is wrong. Where you skim, the paragraph is filler. Where you nod, the sentence works. Reading aloud catches what the eye misses.

---

## Reference

This catalogue draws on [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) (WikiProject AI Cleanup), which documents patterns from thousands of observed instances of AI-generated text on Wikipedia.

Key insight from that work: **"LLMs use statistical algorithms to guess what should come next. The result tends toward the most statistically likely result that applies to the widest variety of cases."** Humanizing prose means actively breaking that statistical default — through specificity, opinion, rhythm variance, and admitted complexity.
