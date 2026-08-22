import { createClient } from '@supabase/supabase-js';
import HomeClient from "./HomeClient";
import SchemaScript from "@/components/SchemaScript";
import { homepageSchema } from "@/lib/schemas";
import { PAGE_METADATA } from "@/lib/metadata";
import type { Metadata } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY 
  ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const metadata: Metadata = PAGE_METADATA.home;

export const revalidate = 300;

export default async function HomePage() {
 const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const [roomsResult, contentResult] = await Promise.all([
      supabase
        // `size` and `view` are selected here too. Without them the
        // server-rendered HTML showed "Not specified" / "Standard View" (the
        // fallbacks in mapRoom), and the client-side refresh — which does
        // select them — swapped in the real values afterwards. That was a
        // visible content flip and a layout shift charged to CLS.
        .from("rooms")
        .select("id, name, base_price, max_guests, description, images, amenities, size, view")
        .order("created_at", { ascending: true }),
      supabase
        .from("homepage_content")
        .select("*")
        .order("section"),
    ]);

    if (roomsResult.error) console.error("Error fetching rooms:", roomsResult.error);
    if (contentResult.error) console.error("Error fetching content:", contentResult.error);

    return (
      <>
        {/* JSON-LD structured data — helps Google show rich results */}
        <SchemaScript schema={homepageSchema} />
        <HomeClient
          rooms={roomsResult.data || []}
          initialContent={contentResult.data || []}
        />
      </>
    );
  } catch (error) {
    console.error("Unexpected error fetching data:", error);
    return (
      <>
        <SchemaScript schema={homepageSchema} />
        <HomeClient rooms={[]} initialContent={[]} />
      </>
    );
  }
}
