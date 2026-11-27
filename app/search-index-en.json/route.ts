import { buildEnglishSearchDocs } from "@/lib/search-docs";

export const dynamic = "force-static";

export function GET() {
  return Response.json(buildEnglishSearchDocs());
}
