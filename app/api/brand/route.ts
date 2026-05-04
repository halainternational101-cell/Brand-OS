import { NextRequest, NextResponse } from "next/server";
import { anthropic, extractText, parseJSON } from "@/lib/anthropic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { passion, skills, mission, vocation, niche } = body;

    const prompt = niche
      ? `You are a personal brand strategist. Based on this creator's niche: "${niche}"

Generate a complete brand blueprint as JSON with this exact structure:
{
  "positioningStatement": "A single compelling sentence that defines who you help, what you help them do, and how you're different",
  "idealClientAvatar": {
    "name": "Give them a name",
    "age": "age range",
    "role": "their job/role",
    "struggles": ["struggle 1", "struggle 2", "struggle 3"],
    "desires": ["desire 1", "desire 2", "desire 3"],
    "transformation": "The key transformation they seek"
  },
  "voiceGuide": {
    "tone": "2-3 words describing your tone",
    "style": "How you communicate",
    "doList": ["do this", "do this", "do this"],
    "dontList": ["avoid this", "avoid this", "avoid this"]
  },
  "contentPillars": [
    {
      "name": "Pillar name",
      "description": "What this pillar covers",
      "exampleTopics": ["topic 1", "topic 2", "topic 3"]
    },
    {
      "name": "Pillar name",
      "description": "What this pillar covers",
      "exampleTopics": ["topic 1", "topic 2", "topic 3"]
    },
    {
      "name": "Pillar name",
      "description": "What this pillar covers",
      "exampleTopics": ["topic 1", "topic 2", "topic 3"]
    }
  ]
}`
      : `You are a personal brand strategist using the Ikigai framework.

Creator's Ikigai inputs:
- Passion (what they love): ${passion}
- Skills (what they're good at): ${skills}
- Mission (what the world needs): ${mission}
- Vocation (what they can be paid for): ${vocation}

Generate a complete brand blueprint as JSON with this exact structure:
{
  "positioningStatement": "A single compelling sentence that defines who you help, what you help them do, and how you're different",
  "idealClientAvatar": {
    "name": "Give them a name",
    "age": "age range",
    "role": "their job/role",
    "struggles": ["struggle 1", "struggle 2", "struggle 3"],
    "desires": ["desire 1", "desire 2", "desire 3"],
    "transformation": "The key transformation they seek"
  },
  "voiceGuide": {
    "tone": "2-3 words describing your tone",
    "style": "How you communicate",
    "doList": ["do this", "do this", "do this"],
    "dontList": ["avoid this", "avoid this", "avoid this"]
  },
  "contentPillars": [
    {
      "name": "Pillar name",
      "description": "What this pillar covers",
      "exampleTopics": ["topic 1", "topic 2", "topic 3"]
    },
    {
      "name": "Pillar name",
      "description": "What this pillar covers",
      "exampleTopics": ["topic 1", "topic 2", "topic 3"]
    },
    {
      "name": "Pillar name",
      "description": "What this pillar covers",
      "exampleTopics": ["topic 1", "topic 2", "topic 3"]
    }
  ]
}

Return only valid JSON, no additional text.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = extractText(message.content);
    const blueprint = parseJSON(text);

    return NextResponse.json({ blueprint });
  } catch (error) {
    console.error("Brand API error:", error);
    return NextResponse.json(
      { error: "Failed to generate brand blueprint" },
      { status: 500 }
    );
  }
}
