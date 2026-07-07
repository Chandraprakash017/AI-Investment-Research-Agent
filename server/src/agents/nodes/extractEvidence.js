const { getLLM, parseJSONResponse } = require('../../services/llmService');
const { HumanMessage, SystemMessage } = require('@langchain/core/messages');

const BATCH_SIZE = 5;

const normalizeText = (text = '') => {
  return String(text)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
};

const extractEvidence = async (state) => {
  console.log(
    `[Node: extractEvidence] Extracting evidence for: ${state.companyName}`
  );

  if (state.errors && state.errors.length > 0) return state;

  if (!state.rawResearch || state.rawResearch.length === 0) {
    return {
      errors: [...(state.errors || []), 'No research collected.']
    };
  }

  const llm = getLLM(0.2);

  try {
    // Give every collected source a stable internal ID.
    // The LLM refers to the ID, while JavaScript keeps control
    // of the real URL and title.
    const indexedSources = state.rawResearch
      .filter(
        (source) =>
          source &&
          typeof source.url === 'string' &&
          typeof source.content === 'string' &&
          source.content.trim().length > 0
      )
      .map((source, index) => ({
        ...source,
        sourceId: `S${index + 1}`
      }));

    if (indexedSources.length === 0) {
      throw new Error('No usable research sources were collected.');
    }

    // Split sources into small batches to reduce LLM calls
    // while keeping source identity explicit.
    const batches = [];

    for (let i = 0; i < indexedSources.length; i += BATCH_SIZE) {
      batches.push(indexedSources.slice(i, i + BATCH_SIZE));
    }

    const extractionPromises = batches.map(async (batch, batchIndex) => {
      const batchText = batch
        .map(
          (source) => `
SOURCE ID: ${source.sourceId}
TITLE: ${source.title}
CONTENT:
${source.content}
`
        )
        .join('\n---\n');

      const prompt = `
You are a careful financial research analyst.

Extract factual investment evidence about ${state.companyName} from ONLY the sources provided below.

${batchText}

Rules:
- Use only facts directly supported by the provided source content.
- Do not use outside knowledge.
- Do not invent, estimate, calculate, or combine numbers.
- Keep every claim linked to exactly one SOURCE ID.
- For every claim, copy a short exact supporting excerpt from that same source.
- The supportingText must appear word-for-word in the source content.
- If a source has no useful investment evidence, skip it.
- Extract only the most decision-relevant facts.

Output a JSON object with one key called "evidence".

Each evidence item must contain exactly:
- claim: a factual claim
- sourceId: the exact SOURCE ID that supports the claim
- supportingText: a short exact excerpt copied from that source
- category: one of ["business", "financial", "growth", "competition", "risk", "news"]
- signal: one of ["positive", "negative", "neutral"]
- relevanceScore: a number from 1 to 10

Example:
{
  "evidence": [
    {
      "claim": "The company reported 12% year-over-year revenue growth.",
      "sourceId": "S1",
      "supportingText": "Revenue increased 12% year-over-year",
      "category": "financial",
      "signal": "positive",
      "relevanceScore": 9
    }
  ]
}
`;

      try {
        const response = await llm.invoke([
          new SystemMessage(
            'You extract evidence from provided sources and output structured JSON.'
          ),
          new HumanMessage(prompt)
        ]);

        const parsed = parseJSONResponse(response.content);

        if (!parsed.evidence || !Array.isArray(parsed.evidence)) {
          return [];
        }

        return parsed.evidence;
      } catch (error) {
        console.error(
          `[Node: extractEvidence] Batch ${batchIndex + 1} failed:`,
          error.message
        );

        // One failed batch should not stop the full workflow.
        return [];
      }
    });

    const extractionResults = await Promise.all(extractionPromises);
    const extractedEvidence = extractionResults.flat();

    const sourceMap = new Map(
      indexedSources.map((source) => [source.sourceId, source])
    );

    const validCategories = new Set([
      'business',
      'financial',
      'growth',
      'competition',
      'risk',
      'news'
    ]);

    const validSignals = new Set([
      'positive',
      'negative',
      'neutral'
    ]);

    const seenClaims = new Set();
    let rejectedCount = 0;

    const validatedEvidence = extractedEvidence
      .filter((item) => {
        if (
          !item ||
          typeof item.claim !== 'string' ||
          item.claim.trim().length === 0 ||
          typeof item.sourceId !== 'string' ||
          typeof item.supportingText !== 'string'
        ) {
          rejectedCount++;
          return false;
        }

        const trustedSource = sourceMap.get(item.sourceId);

        if (!trustedSource) {
          rejectedCount++;
          return false;
        }

        const normalizedSourceContent = normalizeText(
          trustedSource.content
        );

        const normalizedSupportingText = normalizeText(
          item.supportingText
        );

        // Deterministic support check:
        // the quoted evidence must actually exist in the source content.
        if (
          normalizedSupportingText.length < 15 ||
          !normalizedSourceContent.includes(normalizedSupportingText)
        ) {
          rejectedCount++;
          return false;
        }

        return true;
      })
      .map((item) => {
        const trustedSource = sourceMap.get(item.sourceId);

        return {
          claim: item.claim.trim(),

          category: validCategories.has(item.category)
            ? item.category
            : 'news',

          source: trustedSource.url,

          sourceTitle: trustedSource.title,

          signal: validSignals.has(item.signal)
            ? item.signal
            : 'neutral',

          relevanceScore: Math.max(
            1,
            Math.min(10, Number(item.relevanceScore) || 1)
          )
        };
      })
      .filter((item) => {
        const normalizedClaim = normalizeText(item.claim);

        if (seenClaims.has(normalizedClaim)) {
          return false;
        }

        seenClaims.add(normalizedClaim);
        return true;
      });

    if (validatedEvidence.length === 0) {
      throw new Error(
        'No evidence passed source-support verification.'
      );
    }

    console.log(
      `[Node: extractEvidence] Verified ${validatedEvidence.length} evidence items, rejected ${rejectedCount}, using ${batches.length} batches`
    );

    return {
      evidence: validatedEvidence
    };
  } catch (error) {
    console.error('Error in extractEvidence:', error);

    return {
      errors: [
        ...(state.errors || []),
        `extractEvidence error: ${error.message}`
      ]
    };
  }
};

module.exports = { extractEvidence };
