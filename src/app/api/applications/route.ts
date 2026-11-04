import { isReadOnlyDemo, readOnlyResponse } from "@/lib/deployment-mode";
import { getDemoApplications } from "@/lib/demo-applications";
import { localToday } from "@/lib/applications";
import { validateApplication } from "@/lib/validation";
import { apiError, sameOrigin } from "@/lib/api-errors";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const rows = isReadOnlyDemo() ? getDemoApplications(localToday()) : await (await import("@/lib/application-store")).listApplications();
    return Response.json(rows, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return apiError(error);
  }
}
export async function POST(request: Request) {
  if (isReadOnlyDemo()) return readOnlyResponse();
  if (!sameOrigin(request))
    return Response.json(
      { error: "Please submit from your ApplyFlow workspace." },
      { status: 403 },
    );
  try {
    const { db } = await import("@/lib/db");
    const { serializeApplication, toDatabase } = await import("@/lib/application-store");
    const result = validateApplication(await request.json());
    if (result.error)
      return Response.json({ error: result.error }, { status: 400 });
    const row = await db.jobApplication.create({
      data: toDatabase(result.data!),
    });
    return Response.json(serializeApplication(row), { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
