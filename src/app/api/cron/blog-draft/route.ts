// FILE: src/app/api/cron/blog-draft/route.ts
// UPDATED to match your actual existing blog_drafts table columns:
// title, slug, target_keyword, content_md, excerpt, meta_description, meta_keywords, status, generated_by, reviewer_notes, created_at, reviewed_at

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const BLOG_SCHEDULE = [
  { topic: "Ultimate Alibag Travel Guide 2026", keyword: "alibag travel guide", slug: "alibag-travel-guide" },
  { topic: "Top 10 Beaches Near Alibag", keyword: "beaches near alibag", slug: "top-beaches-near-alibag" },
  { topic: "Mumbai to Alibag Ferry Complete Guide", keyword: "mumbai to alibag ferry", slug: "mumbai-to-alibag-ferry" },
  { topic: "Alibag in Monsoon — Why It's Beautiful", keyword: "alibag in monsoon", slug: "alibag-in-monsoon" },
  { topic: "Weekend Getaway from Mumbai to Alibag", keyword: "weekend getaway from mumbai alibag", slug: "weekend-getaway-mumbai-alibag" },
  { topic: "Alibag with Kids — Family Travel Guide", keyword: "alibag with kids family trip", slug: "alibag-with-kids" },
  { topic: "Best Things to Do in Alibag", keyword: "things to do in alibag", slug: "things-to-do-in-alibag" },
  { topic: "Nagaon Beach Alibag Complete Guide", keyword: "nagaon beach alibag", slug: "nagaon-beach-alibag-guide" },
];

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const weekIndex =
    Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)) % BLOG_SCHEDULE.length;
  const { topic, keyword, slug } = BLOG_SCHEDULE[weekIndex];

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      system:
        'You are a travel content writer for Sukhakarta Holiday Home, a homestay in Alibag, Maharashtra, India. Write helpful, genuine travel guides that rank on Google. Style: conversational but informative. Naturally mention Sukhakarta Holiday Home once or twice as a recommended stay option — never forced. Website: sukhakartaholidayhome.in. Format the main content in Markdown. Respond ONLY with valid JSON in this exact shape, no markdown fences, no preamble: {"meta_description": "...", "excerpt": "...", "content_md": "..."} where meta_description is under 155 chars, excerpt is a 2-sentence teaser, and content_md is the full 1200-1800 word article in markdown with H2/H3 headings and an FAQ section.',
      messages: [
        {
          role: "user",
          content: `Write a comprehensive blog post about: "${topic}". Target keyword: "${keyword}".`,
        },
      ],
    }),
  });

  const data = await response.json();
  const rawText = data.content?.[0]?.text || "{}";

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    parsed = { meta_description: "", excerpt: "", content_md: rawText };
  }

  const { error: insertError } = await supabase.from("blog_drafts").insert({
    title: topic,
    slug,
    target_keyword: keyword,
    content_md: parsed.content_md || "",
    excerpt: parsed.excerpt || "",
    meta_description: parsed.meta_description || "",
    meta_keywords: keyword,
    status: "pending_review",
    generated_by: "claude-api",
  });

  return NextResponse.json({
    success: !insertError,
    topic,
    keyword,
    error: insertError?.message || null,
  });
}