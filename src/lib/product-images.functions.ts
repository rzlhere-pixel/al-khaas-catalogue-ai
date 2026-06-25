import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  brand: z.string().min(1),
  category: z.string().optional().default(""),
  packaging: z.string().optional().default(""),
});

const ModelOutput = z.object({
  image_url: z.string().url().nullable(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().optional().default(""),
});

const SYSTEM = `You help find official-looking product photos for a confectionery wholesaler's catalogue.
Return STRICT JSON: { "image_url": string|null, "confidence": number (0..1), "reasoning": string }.
- Prefer the brand's own CDN or a well-known retailer (e.g. official brand sites, Amazon, Carrefour, Lulu, manufacturer press kits).
- The URL MUST point directly to an image file (.jpg / .jpeg / .png / .webp), not an HTML page.
- confidence reflects how sure you are that the URL exists AND depicts THIS exact SKU (name + packaging + brand). If unsure, lower the confidence; do not guess random URLs.
- If you cannot recall a specific verified URL, return image_url: null and confidence: 0.`;

async function callGateway(apiKey: string, userPrompt: string): Promise<string> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`AI gateway ${res.status}: ${text.slice(0, 300)}`);
  }
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return json.choices?.[0]?.message?.content ?? "{}";
}

async function validateImageUrl(url: string): Promise<{ ok: boolean; contentType?: string }> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    let res = await fetch(url, { method: "HEAD", signal: controller.signal, redirect: "follow" });
    // Some CDNs reject HEAD; fall back to a tiny GET
    if (!res.ok || !res.headers.get("content-type")) {
      res = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        redirect: "follow",
        headers: { Range: "bytes=0-1023" },
      });
    }
    clearTimeout(timer);
    const ct = res.headers.get("content-type") ?? "";
    return { ok: res.ok && ct.startsWith("image/"), contentType: ct };
  } catch {
    return { ok: false };
  }
}

export const lookupProductImage = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Mark as in-progress so concurrent requests don't repeat work
    await supabaseAdmin.from("product_images").upsert({
      product_id: data.productId,
      status: "searching",
      updated_at: new Date().toISOString(),
    });

    const userPrompt = `Find the best official product image URL for this SKU:
- Brand: ${data.brand}
- Name: ${data.name}
- Packaging: ${data.packaging || "n/a"}
- Category: ${data.category || "n/a"}

Return JSON only.`;

    let parsed: z.infer<typeof ModelOutput>;
    try {
      const raw = await callGateway(apiKey, userPrompt);
      parsed = ModelOutput.parse(JSON.parse(raw));
    } catch (err) {
      const row = {
        product_id: data.productId,
        image_url: null,
        confidence: 0,
        status: "error",
        reasoning: err instanceof Error ? err.message.slice(0, 500) : "unknown error",
        source: "gemini-3-flash-preview",
        updated_at: new Date().toISOString(),
      };
      await supabaseAdmin.from("product_images").upsert(row);
      return row;
    }

    let { image_url, confidence } = parsed;
    let status: "found" | "low_confidence" | "invalid_url" | "not_found" = "not_found";

    if (image_url) {
      const check = await validateImageUrl(image_url);
      if (!check.ok) {
        // The model gave a URL that does not resolve to an image — discard it.
        confidence = Math.min(confidence, 0.1);
        status = "invalid_url";
        image_url = null;
      } else {
        status = confidence >= 0.7 ? "found" : "low_confidence";
      }
    }

    const row = {
      product_id: data.productId,
      image_url,
      confidence,
      status,
      reasoning: parsed.reasoning.slice(0, 500),
      source: "gemini-3-flash-preview",
      updated_at: new Date().toISOString(),
    };
    await supabaseAdmin.from("product_images").upsert(row);
    return row;
  });
