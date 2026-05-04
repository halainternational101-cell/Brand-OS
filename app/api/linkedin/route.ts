import { NextRequest, NextResponse } from "next/server";
import { anthropic, extractText, parseJSON } from "@/lib/anthropic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic } = body;

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const prompt = `You are a LinkedIn content strategist for personal brand builders.

Topic: "${topic}"

Generate 6 LinkedIn posts in different formats. Return JSON with this exact structure:
{
  "posts": [
    {
      "type": "Story",
      "hook": "First line that stops the scroll",
      "body": "The full post content (3-5 short paragraphs, use line breaks)",
      "cta": "Call to action line"
    },
    {
      "type": "Listicle",
      "hook": "First line that stops the scroll",
      "body": "The full post content with numbered list",
      "cta": "Call to action line"
    },
    {
      "type": "Framework",
      "hook": "First line that stops the scroll",
      "body": "The full post with a named framework or system",
      "cta": "Call to action line"
    },
    {
      "type": "Contrarian",
      "hook": "First line that stops the scroll",
      "body": "Post that challenges a common belief",
      "cta": "Call to action line"
    },
    {
      "type": "Data Insight",
      "hook": "First line that stops the scroll",
      "body": "Post built around a statistic or data point",
      "cta": "Call to action line"
    },
    {
      "type": "Quick Win",
      "hook": "First line that stops the scroll",
      "body": "Short, punchy post with immediate actionable value",
      "cta": "Call to action line"
    }
  ]
}

Make each post feel authentic, not corporate. Use short sentences. No buzzwords. Return only valid JSON.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = extractText(message.content);
    const data = parseJSON<{ posts: unknown[] }>(text);

    return NextResponse.json(data);
  } catch (error) {
    console.error("LinkedIn API error:", error);
    return NextResponse.json(
      { error: "Failed to generate LinkedIn posts" },
      { status: 500 }
    );
  }
}
