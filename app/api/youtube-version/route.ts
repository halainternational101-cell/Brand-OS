import { NextRequest, NextResponse } from "next/server";
import { anthropic, extractText, parseJSON } from "@/lib/anthropic";
import { createServerClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, hookType, pattern, user_id } = body as {
      title: string;
      hookType?: string;
      pattern?: string;
      user_id?: string;
    };

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const prompt = `You are a YouTube content strategist specialising in viral video scripts.

Outlier video to remix:
- Title: "${title}"
- Hook pattern: "${hookType ?? "curiosity gap"}"
- Success pattern: "${pattern ?? "unknown"}"

Generate a complete YouTube content plan as JSON with this exact structure:
{
  "remixedTitle": "Your new title using the same hook pattern",
  "altTitles": ["alternative title 1", "alternative title 2"],
  "hook": {
    "line1": "Opening line (say this first)",
    "line2": "Second line (build tension)",
    "line3": "Third line (payoff/promise)",
    "line4": "Fourth line (bridge to content)",
    "line5": "Fifth line (set up the video)",
    "line6": "Sixth line (viewer benefit)",
    "line7": "Seventh line (final hook before content)"
  },
  "scriptOutline": [
    { "section": "Intro", "duration": "0:00-0:30", "notes": "what to cover" },
    { "section": "Main Point 1", "duration": "0:30-2:00", "notes": "what to cover" },
    { "section": "Main Point 2", "duration": "2:00-4:00", "notes": "what to cover" },
    { "section": "Main Point 3", "duration": "4:00-6:00", "notes": "what to cover" },
    { "section": "Outro", "duration": "6:00-7:00", "notes": "what to cover" }
  ],
  "cta": "The call to action to end the video",
  "thumbnailBrief": {
    "text": "Bold text overlay (max 4 words)",
    "visual": "Describe the main visual element",
    "emotion": "The emotion/expression to convey"
  }
}

Return only valid JSON.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = extractText(message.content);
    const plan = parseJSON<{
      remixedTitle: string;
      altTitles: string[];
      hook: Record<string, string>;
      scriptOutline: object[];
      cta: string;
      thumbnailBrief: object;
    }>(text);

    if (user_id && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const db = createServerClient();
      await db.from("youtube_versions").insert({
        user_id,
        original_title: title,
        hook_type: hookType ?? null,
        pattern: pattern ?? null,
        remixed_title: plan.remixedTitle,
        alt_titles: plan.altTitles,
        hook_lines: plan.hook,
        script_outline: plan.scriptOutline,
        cta: plan.cta,
        thumbnail_brief: plan.thumbnailBrief,
      });
    }

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("YouTube version API error:", error);
    return NextResponse.json(
      { error: "Failed to generate YouTube content plan" },
      { status: 500 }
    );
  }
}
