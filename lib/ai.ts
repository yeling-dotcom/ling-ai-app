type Intelligence = {
  ai_summary: string;
  ai_summary_source: string;
  ai_summary_confidence: number;
  ai_summary_review_status: "unreviewed";
  ai_tags: string[];
  ai_tags_source: string;
  ai_tags_confidence: number;
  ai_tags_review_status: "unreviewed";
};

function clamp(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? Math.min(1, Math.max(0, number)) : 0.5;
}

function responseText(payload: Record<string, unknown>) {
  if (typeof payload.output_text === "string") return payload.output_text;
  const output = Array.isArray(payload.output) ? payload.output : [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = Array.isArray((item as { content?: unknown }).content)
      ? (item as { content: unknown[] }).content
      : [];
    for (const part of content) {
      if (part && typeof part === "object" && typeof (part as { text?: unknown }).text === "string") {
        return (part as { text: string }).text;
      }
    }
  }
  return "";
}

export async function generatePostIntelligence(title: string, body: string): Promise<Intelligence | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL ?? "gpt-5-mini";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4_500);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "system",
            content: "Return only valid JSON with summary (maximum 120 characters), summary_confidence (0-1), tags (up to 5 short strings), and tags_confidence (0-1). Do not add markdown.",
          },
          { role: "user", content: `Title: ${title}\n\nBody:\n${body.slice(0, 12_000)}` },
        ],
        max_output_tokens: 220,
      }),
      signal: controller.signal,
    });

    if (!response.ok) throw new Error(`OpenAI returned ${response.status}`);
    const payload = (await response.json()) as Record<string, unknown>;
    const text = responseText(payload).replace(/^```json\s*|\s*```$/g, "").trim();
    const parsed = JSON.parse(text) as Record<string, unknown>;
    const summary = String(parsed.summary ?? "").trim().slice(0, 120);
    const tags = (Array.isArray(parsed.tags) ? parsed.tags : [])
      .map((tag) => String(tag).trim())
      .filter(Boolean)
      .slice(0, 5);
    if (!summary) throw new Error("OpenAI returned an empty summary");

    return {
      ai_summary: summary,
      ai_summary_source: `openai/${model}`,
      ai_summary_confidence: clamp(parsed.summary_confidence),
      ai_summary_review_status: "unreviewed",
      ai_tags: tags,
      ai_tags_source: `openai/${model}`,
      ai_tags_confidence: clamp(parsed.tags_confidence),
      ai_tags_review_status: "unreviewed",
    };
  } catch (error) {
    console.error("Post intelligence generation failed", error instanceof Error ? error.message : error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
