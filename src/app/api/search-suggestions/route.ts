import { getSearchSuggestionsFromDatabase } from "@/lib/iaa-db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("s") ?? url.searchParams.get("q") ?? "";

  return Response.json(
    {
      suggestions: getSearchSuggestionsFromDatabase(query, 6),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
