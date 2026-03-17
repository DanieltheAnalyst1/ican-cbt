import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SubQuestionGrade {
  subQuestionId: string;
  score: number;
  maxMarks: number;
  strengths: string[];
  improvements: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { answers, subQuestions } = await req.json();

    // answers: Record<string, string> — student answers keyed by sub_question id
    // subQuestions: Array<{ id, label, text, marks, modelAnswer, keyPoints, hints }>

    const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");
    if (!DEEPSEEK_API_KEY) {
      return new Response(
        JSON.stringify({ error: "DEEPSEEK_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build grading prompt for all sub-questions at once
    const gradingItems = subQuestions.map((sq: any) => {
      const studentAnswer = answers[sq.id]?.trim() || "";
      return {
        id: sq.id,
        label: sq.label,
        questionText: sq.text,
        maxMarks: sq.marks,
        modelAnswer: sq.modelAnswer,
        keyPoints: sq.keyPoints,
        studentAnswer: studentAnswer || "(No answer provided)",
      };
    });

    const systemPrompt = `You are an expert ICAN (Institute of Chartered Accountants of Nigeria) exam marker. Grade each student answer against the model answer and key points provided.

For each sub-question, provide:
1. A score out of the maximum marks (be fair but rigorous — partial credit for partially correct answers)
2. 1-3 specific strengths of the answer
3. 1-3 specific areas for improvement

Scoring guidelines:
- Award marks for each key point correctly addressed
- Give partial credit for relevant but incomplete points
- Award 0 for unanswered or completely irrelevant answers
- Consider the quality of explanation, not just keywords
- Professional presentation and structure should earn credit
- Student answers may contain LaTeX notation (e.g. $$\\frac{a}{b}$$, $$\\sum_{i=1}^{n}$$). Interpret these as their rendered mathematical equivalents when grading. Treat LaTeX and plain-text math representations equally.

You MUST respond with valid JSON only — no markdown, no explanation outside the JSON.`;

    const userPrompt = `Grade the following ${gradingItems.length} sub-question(s):

${JSON.stringify(gradingItems, null, 2)}

Respond with ONLY this JSON structure:
{
  "grades": [
    {
      "id": "<sub_question_id>",
      "score": <number>,
      "maxMarks": <number>,
      "strengths": ["strength1", "strength2"],
      "improvements": ["improvement1", "improvement2"]
    }
  ]
}`;

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("DeepSeek API error:", response.status, errText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited — please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI grading service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response (handle potential markdown wrapping)
    let parsed: { grades: SubQuestionGrade[] };
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      console.error("Failed to parse DeepSeek response:", content);
      // Fallback: generate basic scores
      parsed = {
        grades: subQuestions.map((sq: any) => {
          const hasAnswer = !!answers[sq.id]?.trim();
          return {
            id: sq.id,
            score: hasAnswer ? Math.round(sq.marks * 0.5) : 0,
            maxMarks: sq.marks,
            strengths: hasAnswer ? ["Attempt was made"] : [],
            improvements: hasAnswer ? ["Review model answer for complete response"] : ["Question was not attempted"],
          };
        }),
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("grade-answers error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
