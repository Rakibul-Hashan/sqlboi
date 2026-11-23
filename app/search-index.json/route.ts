import { buildSearchDocs } from "@/lib/search-docs";

// বিল্ডের সময় একবার বানানো স্থির JSON (/search-index.json); সার্চ ডায়ালগ প্রথমবার খুললে নামে।
export const dynamic = "force-static";

export function GET() {
  return Response.json(buildSearchDocs());
}
