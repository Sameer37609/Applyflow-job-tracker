import { Dashboard } from "@/components/dashboard";
import { localToday } from "@/lib/applications";
import { listApplications } from "@/lib/application-store";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export default async function Home() {
  return (
    <Dashboard
      initialApplications={await listApplications()}
      reportDate={localToday()}
    />
  );
}
