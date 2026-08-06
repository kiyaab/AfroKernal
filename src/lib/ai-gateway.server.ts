const GATEWAY = "https://ai.gateway.lovable.dev/v1";

function getApiKey(customKey?: string) {
  const k = customKey || process.env.LOVABLE_API_KEY;
  if (!k) throw new Error("Missing AI API Key. Please configure it in the Admin Dashboard or as LOVABLE_API_KEY.");
  return k;
}

export async function embed(text: string, customApiKey?: string): Promise<number[]> {
  const res = await fetch(`${GATEWAY}/embeddings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey(customApiKey)}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/text-embedding-3-small",
      input: text,
    }),
  });
  if (!res.ok) throw new Error(`Embedding failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.data[0].embedding as number[];
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function chat(messages: ChatMessage[], customApiKey?: string): Promise<string> {
  const res = await fetch(`${GATEWAY}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey(customApiKey)}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-1.5-flash",
      messages,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    if (res.status === 429) throw new Error("AI rate limit reached. Please try again shortly.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please add credits to continue.");
    throw new Error(`AI request failed: ${res.status} ${body}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}
