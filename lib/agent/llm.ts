import { HfInference } from '@huggingface/inference';
import { RiskAnalysis } from './riskEngine';
import { ActionProposal } from './executor';

const hf = new HfInference(process.env.HF_ACCESS_TOKEN!);

export async function generateNarrative(input: {
  risk: RiskAnalysis;
  proposal: ActionProposal | null;
  market: any;
}) {
  try {
    const prompt = `
You are the Autonomous Treasury Guardian AI. Produce a concise, professional narrative for a treasury dashboard.

RISK STATUS:
${JSON.stringify(input.risk, null, 2)}

PROPOSED ACTION:
${JSON.stringify(input.proposal, null, 2)}

MARKET DATA:
${JSON.stringify(input.market, null, 2)}

Write a 3–5 sentence explanation covering:
- The current treasury state
- Why the risk level is what it is
- Why the proposed action is justified
- Short forward-looking note
`;

    const completion = await hf.textGeneration({
      model: "HuggingFaceH4/zephyr-7b-beta",
      inputs: prompt,
      parameters: {
        max_new_tokens: 200,
        temperature: 0.3,
        return_full_text: false
      }
    });

    return completion.generated_text;
  } catch (err) {
    console.error("LLM Generation Failed", err);
    return "AI reasoning unavailable. Running deterministic risk interpretation only.";
  }
}

