export function supabaseLoader({ src, width, quality }: {
  src: string;
  width: number;
  quality?: number;
}) {
  // If it's already a Supabase URL with transformations, return as-is
  if (src.includes('supabase.co') && src.includes('/storage/v1/object/public/')) {
    return `${src}?width=${width}&quality=${quality || 75}`;
  }
  
  return src;
}
