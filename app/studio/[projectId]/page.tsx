import { notFound } from "next/navigation";
import { getProjectById, createNewProject } from "@/lib/db-store";
import StudioWorkspace from "@/components/studio/studio-workspace";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function StudioPage({ params }: PageProps) {
  const { projectId } = await params;

  let project = await getProjectById(projectId);

  // If project doesn't exist, create an initial one with this ID so the user can immediately produce music!
  if (!project) {
    project = await createNewProject("demo-user-id", "New Recording Session", 124);
  }

  return <StudioWorkspace initialProject={project} />;
}
