import prisma from "./prisma";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { ProjectData, TrackData, TimelineItemData } from "@/types";

// Local JSON fallback store for offline / non-Postgres local testing
const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "soundforge-db.json");

interface LocalDB {
  users: Array<{
    id: string;
    name: string | null;
    email: string;
    password: string;
    createdAt: string;
  }>;
  projects: ProjectData[];
}

function getLocalDB(): LocalDB {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial: LocalDB = {
        users: [],
        projects: [
          {
            id: "demo-project-1",
            name: "Neon Sunrise (Demo)",
            userId: "demo-user-id",
            bpm: 124,
            duration: 60,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tracks: [
              {
                id: "track-1",
                name: "Lead Synth",
                projectId: "demo-project-1",
                volume: 0.85,
                pan: 0,
                muted: false,
                solo: false,
                order: 0,
                color: "#22C55E",
                timelineItems: [
                  {
                    id: "clip-1",
                    name: "Synth Riff",
                    trackId: "track-1",
                    audioUrl: "",
                    startTime: 0,
                    endTime: 8,
                    duration: 8,
                  },
                ],
              },
              {
                id: "track-2",
                name: "Bassline",
                projectId: "demo-project-1",
                volume: 0.9,
                pan: -0.1,
                muted: false,
                solo: false,
                order: 1,
                color: "#38BDF8",
                timelineItems: [
                  {
                    id: "clip-2",
                    name: "808 Bass",
                    trackId: "track-2",
                    audioUrl: "",
                    startTime: 0,
                    endTime: 16,
                    duration: 16,
                  },
                ],
              },
              {
                id: "track-3",
                name: "Vocal Recording",
                projectId: "demo-project-1",
                volume: 0.8,
                pan: 0.1,
                muted: false,
                solo: false,
                order: 2,
                color: "#A855F7",
                timelineItems: [],
              },
            ],
          },
        ],
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
      return initial;
    }
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Local DB read error:", err);
    return { users: [], projects: [] };
  }
}

function saveLocalDB(data: LocalDB) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Local DB write error:", err);
  }
}

// ----------------- USER OPERATIONS -----------------

export async function findUserByEmail(email: string) {
  const normalizedEmail = email.toLowerCase().trim();
  try {
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (user) return user;
  } catch (e) {
    // fallback
  }

  const db = getLocalDB();
  return db.users.find((u) => u.email === normalizedEmail) || null;
}

export async function createUser(data: {
  email: string;
  password: string;
  name?: string;
}) {
  const normalizedEmail = data.email.toLowerCase().trim();
  const hashedPassword = await bcrypt.hash(data.password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: data.name || normalizedEmail.split("@")[0],
      },
    });
    return user;
  } catch (e) {
    // fallback
    const db = getLocalDB();
    const existing = db.users.find((u) => u.email === normalizedEmail);
    if (existing) {
      throw new Error("User already exists with this email");
    }
    const newUser = {
      id: `usr_${Date.now()}`,
      name: data.name || normalizedEmail.split("@")[0],
      email: normalizedEmail,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    saveLocalDB(db);
    return newUser;
  }
}

// ----------------- PROJECT OPERATIONS -----------------

export async function getUserProjects(userId: string): Promise<ProjectData[]> {
  try {
    const projects = await prisma.project.findMany({
      where: { userId },
      include: {
        tracks: {
          include: {
            timelineItems: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    if (projects && projects.length > 0) {
      return projects.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        tracks: p.tracks.map((t) => ({
          ...t,
          timelineItems: t.timelineItems.map((ti) => ({
            ...ti,
            createdAt: ti.createdAt.toISOString(),
          })),
        })),
      }));
    }
  } catch (e) {
    // fallback
  }

  const db = getLocalDB();
  const userProjects = db.projects.filter(
    (p) => p.userId === userId || userId === "demo-user-id" || !p.userId
  );
  return userProjects;
}

export async function getProjectById(
  projectId: string
): Promise<ProjectData | null> {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tracks: {
          include: {
            timelineItems: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (project) {
      return {
        ...project,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        tracks: project.tracks.map((t) => ({
          ...t,
          timelineItems: t.timelineItems.map((ti) => ({
            ...ti,
            createdAt: ti.createdAt.toISOString(),
          })),
        })),
      };
    }
  } catch (e) {
    // fallback
  }

  const db = getLocalDB();
  const project = db.projects.find((p) => p.id === projectId);
  return project || null;
}

export async function createNewProject(
  userId: string,
  name = "Untitled Project",
  bpm = 120
): Promise<ProjectData> {
  const defaultTracks = [
    {
      name: "Track 1",
      volume: 0.8,
      pan: 0,
      muted: false,
      solo: false,
      order: 0,
      color: "#22C55E",
    },
    {
      name: "Track 2",
      volume: 0.8,
      pan: 0,
      muted: false,
      solo: false,
      order: 1,
      color: "#38BDF8",
    },
  ];

  try {
    const newProject = await prisma.project.create({
      data: {
        name,
        userId,
        bpm,
        duration: 120,
        tracks: {
          create: defaultTracks,
        },
      },
      include: {
        tracks: {
          include: {
            timelineItems: true,
          },
        },
      },
    });

    return {
      ...newProject,
      createdAt: newProject.createdAt.toISOString(),
      updatedAt: newProject.updatedAt.toISOString(),
      tracks: newProject.tracks.map((t) => ({
        ...t,
        timelineItems: [],
      })),
    };
  } catch (e) {
    // fallback
    const db = getLocalDB();
    const projId = `prj_${Date.now()}`;
    const projectObj: ProjectData = {
      id: projId,
      name,
      userId,
      bpm,
      duration: 120,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tracks: defaultTracks.map((t, idx) => ({
        id: `trk_${projId}_${idx + 1}`,
        projectId: projId,
        name: t.name,
        volume: t.volume,
        pan: t.pan,
        muted: t.muted,
        solo: t.solo,
        order: t.order,
        color: t.color,
        timelineItems: [],
      })),
    };
    db.projects.unshift(projectObj);
    saveLocalDB(db);
    return projectObj;
  }
}

export async function updateProject(
  projectId: string,
  data: Partial<ProjectData>
): Promise<ProjectData | null> {
  try {
    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        name: data.name,
        bpm: data.bpm,
        duration: data.duration,
      },
      include: {
        tracks: {
          include: {
            timelineItems: true,
          },
        },
      },
    });
    return {
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      tracks: updated.tracks.map((t) => ({
        ...t,
        timelineItems: t.timelineItems.map((ti) => ({
          ...ti,
          createdAt: ti.createdAt.toISOString(),
        })),
      })),
    };
  } catch (e) {
    // fallback
    const db = getLocalDB();
    const idx = db.projects.findIndex((p) => p.id === projectId);
    if (idx !== -1) {
      db.projects[idx] = {
        ...db.projects[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      saveLocalDB(db);
      return db.projects[idx];
    }
    return null;
  }
}

export async function deleteProject(projectId: string): Promise<boolean> {
  try {
    await prisma.project.delete({
      where: { id: projectId },
    });
    return true;
  } catch (e) {
    // fallback
    const db = getLocalDB();
    const filtered = db.projects.filter((p) => p.id !== projectId);
    db.projects = filtered;
    saveLocalDB(db);
    return true;
  }
}

export async function duplicateProject(
  projectId: string,
  userId: string
): Promise<ProjectData | null> {
  const original = await getProjectById(projectId);
  if (!original) return null;

  const newName = `${original.name} (Copy)`;

  try {
    const duplicated = await prisma.project.create({
      data: {
        name: newName,
        userId,
        bpm: original.bpm,
        duration: original.duration,
        tracks: {
          create: original.tracks.map((t) => ({
            name: t.name,
            audioUrl: t.audioUrl,
            volume: t.volume,
            pan: t.pan,
            muted: t.muted,
            solo: t.solo,
            order: t.order,
            color: t.color,
            timelineItems: {
              create: t.timelineItems.map((ti) => ({
                name: ti.name,
                audioUrl: ti.audioUrl,
                startTime: ti.startTime,
                endTime: ti.endTime,
                duration: ti.duration,
              })),
            },
          })),
        },
      },
      include: {
        tracks: {
          include: {
            timelineItems: true,
          },
        },
      },
    });

    return {
      ...duplicated,
      createdAt: duplicated.createdAt.toISOString(),
      updatedAt: duplicated.updatedAt.toISOString(),
      tracks: duplicated.tracks.map((t) => ({
        ...t,
        timelineItems: t.timelineItems.map((ti) => ({
          ...ti,
          createdAt: ti.createdAt.toISOString(),
        })),
      })),
    };
  } catch (e) {
    // fallback
    const db = getLocalDB();
    const newId = `prj_${Date.now()}`;
    const duplicatedObj: ProjectData = {
      ...original,
      id: newId,
      name: newName,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tracks: original.tracks.map((t, tIdx) => {
        const newTrackId = `trk_${newId}_${tIdx + 1}`;
        return {
          ...t,
          id: newTrackId,
          projectId: newId,
          timelineItems: t.timelineItems.map((ti, tiIdx) => ({
            ...ti,
            id: `clip_${newTrackId}_${tiIdx + 1}`,
            trackId: newTrackId,
          })),
        };
      }),
    };
    db.projects.unshift(duplicatedObj);
    saveLocalDB(db);
    return duplicatedObj;
  }
}

// ----------------- TRACK & TIMELINE OPERATIONS -----------------

export async function saveProjectState(project: ProjectData): Promise<ProjectData> {
  try {
    // Save to Prisma if DB is configured
    await prisma.project.update({
      where: { id: project.id },
      data: {
        name: project.name,
        bpm: project.bpm,
        duration: project.duration,
        updatedAt: new Date(),
      },
    });

    // Delete existing tracks and recreate or upsert
    for (const track of project.tracks) {
      await prisma.track.upsert({
        where: { id: track.id },
        update: {
          name: track.name,
          volume: track.volume,
          pan: track.pan,
          muted: track.muted,
          solo: track.solo,
          order: track.order,
          color: track.color,
          audioUrl: track.audioUrl,
        },
        create: {
          id: track.id,
          name: track.name,
          projectId: project.id,
          volume: track.volume,
          pan: track.pan,
          muted: track.muted,
          solo: track.solo,
          order: track.order,
          color: track.color,
          audioUrl: track.audioUrl,
        },
      });

      // Upsert timeline items
      for (const item of track.timelineItems) {
        await prisma.timelineItem.upsert({
          where: { id: item.id },
          update: {
            name: item.name,
            startTime: item.startTime,
            endTime: item.endTime,
            duration: item.duration,
            audioUrl: item.audioUrl,
          },
          create: {
            id: item.id,
            name: item.name,
            trackId: track.id,
            startTime: item.startTime,
            endTime: item.endTime,
            duration: item.duration,
            audioUrl: item.audioUrl,
          },
        });
      }
    }
  } catch (e) {
    // fallback
  }

  // Update in local DB store
  const db = getLocalDB();
  const index = db.projects.findIndex((p) => p.id === project.id);
  if (index !== -1) {
    db.projects[index] = {
      ...project,
      updatedAt: new Date().toISOString(),
    };
  } else {
    db.projects.unshift({
      ...project,
      updatedAt: new Date().toISOString(),
    });
  }
  saveLocalDB(db);

  return project;
}
