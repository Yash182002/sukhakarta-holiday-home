import { createClient } from '@supabase/supabase-js';
import AboutClient from './AboutClient';
import { PAGE_METADATA } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = PAGE_METADATA.about;

export const revalidate = 300;

export default async function AboutPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase.from("about_content").select("*");

  if (error) {
    console.error("Error fetching about content for SSR:", error);
  }

  const find = (section: string) => data?.find((s: any) => s.section === section) ?? null;

  return (
    <AboutClient
      initialHero={find("hero")}
      initialStory={find("story")}
      initialValues={find("values")}
    />
  );
}
