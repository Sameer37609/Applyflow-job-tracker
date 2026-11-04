import { db } from "@/lib/db";
import {
  listApplications,
  serializeApplication,
  toDatabase,
} from "@/lib/application-store";
import { validateApplication } from "@/lib/validation";
import { apiError, sameOrigin } from "@/lib/api-errors";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    return Response.json(await listApplications(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return apiError(error);
  }
}
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return Response.json(
      { error: "Please submit from your ApplyFlow workspace." },
      { status: 403 },
    );
  try {
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
