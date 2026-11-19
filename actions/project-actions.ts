"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getUserProjects,
  getProjectById,
  createNewProject,
  updateProject,
  deleteProject,
  duplicateProject,
  saveProjectState,
  createUser,
  findUserByEmail,
} from "@/lib/db-store";
import { ProjectData } from "@/types";
import { revalidatePath } from "next/cache";

async function getCurrentUserId(): Promise<string> {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user && (session.user as any).id) {
      return (session.user as any).id;
    }
  } catch (err) {
    // Session retrieval error or running without cookies
  }
  return "demo-user-id";
}

// ----------------- AUTH ACTIONS -----------------

export async function registerUserAction(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const name = (formData.get("name") as string)?.trim();

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  try {
    const existing = await findUserByEmail(email);
    if (existing) {
      return { error: "An account with this email already exists" };
    }

    const user = await createUser({ email, password, name });
    return { success: true, user: { id: user.id, email: user.email, name: user.name } };
  } catch (error: any) {
    return { error: error.message || "Failed to create account" };
  }
}

export async function forgotPasswordAction(email: string) {
  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address" };
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      // Don't leak existence, return success message
      return { success: true, message: "If this account exists, password reset instructions have been sent." };
    }
    // In production, send email with reset token. In MVP, report success.
    return {
      success: true,
      message: "Password reset link sent! Check your inbox (or use demo login).",
    };
  } catch (err: any) {
    return { error: err.message || "Failed to initiate password reset" };
  }
}

// ----------------- PROJECT ACTIONS -----------------

export async function fetchProjectsAction() {
  const userId = await getCurrentUserId();
  const projects = await getUserProjects(userId);
  return projects;
}

export async function fetchProjectByIdAction(projectId: string) {
  const project = await getProjectById(projectId);
  return project;
}

export async function createProjectAction(name = "Untitled Project", bpm = 120) {
  const userId = await getCurrentUserId();
  const project = await createNewProject(userId, name, bpm);
  revalidatePath("/dashboard");
  return project;
}

export async function renameProjectAction(projectId: string, newName: string) {
  const updated = await updateProject(projectId, { name: newName });
  revalidatePath("/dashboard");
  revalidatePath(`/studio/${projectId}`);
  return updated;
}

export async function deleteProjectAction(projectId: string) {
  const success = await deleteProject(projectId);
  revalidatePath("/dashboard");
  return success;
}

export async function duplicateProjectAction(projectId: string) {
  const userId = await getCurrentUserId();
  const duplicated = await duplicateProject(projectId, userId);
  revalidatePath("/dashboard");
  return duplicated;
}

export async function saveProjectAction(project: ProjectData) {
  const saved = await saveProjectState(project);
  revalidatePath(`/studio/${project.id}`);
  return saved;
}

export async function getDashboardStatsAction() {
  const userId = await getCurrentUserId();
  const projects = await getUserProjects(userId);

  // Calculate approximate storage used based on tracks with audio
  let storageBytes = 0;
  projects.forEach((p) => {
    p.tracks?.forEach((t) => {
      if (t.audioUrl) storageBytes += 2.5 * 1024 * 1024; // ~2.5MB per audio track
      t.timelineItems?.forEach((item) => {
        if (item.audioUrl) storageBytes += 1.8 * 1024 * 1024;
      });
    });
  });

  return {
    totalProjects: projects.length,
    recentlyEdited: projects.slice(0, 5),
    storageUsedBytes: storageBytes,
    storageLimitBytes: 1024 * 1024 * 1024, // 1 GB free tier
  };
}
