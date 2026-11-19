import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserProjects } from "@/lib/db-store";
import DashboardView from "@/components/dashboard/dashboard-view";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user && (session.user as any).id ? (session.user as any).id : "demo-user-id";

  const projects = await getUserProjects(userId);

  return (
    <DashboardView
      initialProjects={projects}
      userEmail={session?.user?.email}
      userName={session?.user?.name}
    />
  );
}
