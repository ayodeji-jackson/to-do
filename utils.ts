import nlp from 'compromise';

// This is heuristic: it works well for typical todo-style inputs (imperatives / short actions). It won't be perfect for complex grammar.
export function splitPhrasesWithCompromise(text: string) {
  if (!text || !text.trim()) return [];

  // 1) First split on strong separators that almost always mean separation
  const strongChunks = text
    .split(/,|;|\bthen\b|&/i)
    .map(s => s.trim())
    .filter(Boolean);

  const result = [];

  for (const chunk of strongChunks) {
    // If chunk doesn't contain " and ", just push it
    if (!/\band\b/i.test(chunk)) {
      result.push(chunk);
      continue;
    }

    // Try splitting on " and " into candidate parts
    const candidateParts = chunk.split(/\b(and)\b/i) // keep 'and' markers
      .reduce((acc: string[], cur) => {
        // reduce into an array of text parts ignoring the literal 'and' tokens
        if (/^and$/i.test(cur)) return acc;
        acc.push(cur.trim());
        return acc;
      }, []);

    // If only two parts (common case), check if we should split using NLP:
    // split if left OR right contains a verb (imperative or action)
    if (candidateParts.length === 2) {
      const left = candidateParts[0];
      const right = candidateParts[1];

      const leftHasVerb = nlp(left).verbs().out('array').length > 0;
      const rightHasVerb = nlp(right).verbs().out('array').length > 0;

      if (leftHasVerb || rightHasVerb) {
        // safe to split
        result.push(left.trim());
        result.push(right.trim());
      } else {
        // likely a noun-noun join (bread and butter) — keep as one
        result.push(chunk.trim());
      }
      continue;
    }

    // If more than two parts split each independently using the same heuristic:
    let splittedAny = false;
    for (let i = 0; i < candidateParts.length; i++) {
      const p = candidateParts[i];
      // look ahead — if this part or next part has verb, we can split here
      const next = candidateParts[i + 1];
      if (!next) {
        result.push(p);
        continue;
      }
      const pHasVerb = nlp(p).verbs().out('array').length > 0;
      const nextHasVerb = nlp(next).verbs().out('array').length > 0;
      if (pHasVerb || nextHasVerb) {
        // push current part separately (we'll handle next on next loop iter)
        result.push(p);
        splittedAny = true;
      } else {
        // merge current and next into one and skip the next
        result.push((p + ' and ' + next).trim());
        i++; // skip next
        splittedAny = true;
      }
    }
    if (!splittedAny) {
      // if heuristics didn't split anything, treat chunk as one
      result.push(chunk.trim());
    }
  }

  // final cleanup
  return result.map(s => s.trim()).filter(Boolean);
}