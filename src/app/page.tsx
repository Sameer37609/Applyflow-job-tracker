import { Dashboard } from "@/components/dashboard";
import { localToday } from "@/lib/applications";
import { isReadOnlyDemo } from "@/lib/deployment-mode";
import { getDemoApplications } from "@/lib/demo-applications";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export default async function Home() {
  const reportDate = localToday();
  const readOnly = isReadOnlyDemo();
  const applications = readOnly ? getDemoApplications(reportDate) : await (await import("@/lib/application-store")).listApplications();
  return (
    <Dashboard
      initialApplications={applications}
      reportDate={reportDate}
      readOnly={readOnly}
    />
  );
}
