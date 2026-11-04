import { db } from "@/lib/db";
import { serializeApplication, toDatabase } from "@/lib/application-store";
import { validateApplication } from "@/lib/validation";
import { apiError, sameOrigin } from "@/lib/api-errors";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, context: Context) {
  if (!sameOrigin(request))
    return Response.json(
      { error: "Please submit from your ApplyFlow workspace." },
      { status: 403 },
    );
  try {
    const { id } = await context.params;
    const result = validateApplication(await request.json());
    if (result.error)
      return Response.json({ error: result.error }, { status: 400 });
    return Response.json(
      serializeApplication(
        await db.jobApplication.update({
          where: { id },
          data: toDatabase(result.data!),
        }),
      ),
    );
  } catch (error) {
    return apiError(error);
  }
}
export async function DELETE(request: Request, context: Context) {
  if (!sameOrigin(request))
    return Response.json(
      { error: "Please submit from your ApplyFlow workspace." },
      { status: 403 },
    );
  try {
    const { id } = await context.params;
    await db.jobApplication.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}
