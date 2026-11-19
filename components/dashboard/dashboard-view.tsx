"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProjectData } from "@/types";
import {
  createProjectAction,
  deleteProjectAction,
  renameProjectAction,
  duplicateProjectAction,
} from "@/actions/project-actions";
import { formatBytes } from "@/lib/utils";
import {
  Plus,
  Folder,
  Music,
  Clock,
  HardDrive,
  Copy,
  Trash2,
  Edit2,
  Play,
  LogOut,
  Sliders,
  Check,
  X,
  Search,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface DashboardViewProps {
  initialProjects: ProjectData[];
  userEmail?: string | null;
  userName?: string | null;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  initialProjects,
  userEmail,
  userName,
}) => {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectData[]>(initialProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectBpm, setNewProjectBpm] = useState(120);

  // Rename modal / inline states
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState("");

  // Storage calculation
  const totalAudioTracks = projects.reduce(
    (acc, p) => acc + (p.tracks?.length || 0),
    0
  );
  const storageUsedBytes = totalAudioTracks * 2.8 * 1024 * 1024;
  const storageLimitBytes = 1024 * 1024 * 1024; // 1GB
  const storagePercent = Math.min(
    100,
    Math.round((storageUsedBytes / storageLimitBytes) * 100)
  );

  // Create Project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newProjectName.trim() || "Untitled Project";
    const bpm = Number(newProjectBpm) || 120;

    const created = await createProjectAction(name, bpm);
    setIsCreating(false);
    setNewProjectName("");
    if (created?.id) {
      router.push(`/studio/${created.id}`);
    } else {
      router.refresh();
    }
  };

  // Delete Project
  const handleDeleteProject = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteProjectAction(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Duplicate Project
  const handleDuplicateProject = async (id: string) => {
    const duplicated = await duplicateProjectAction(id);
    if (duplicated) {
      setProjects((prev) => [duplicated, ...prev]);
    }
  };

  // Rename Project
  const handleRenameSubmit = async (id: string) => {
    if (editingNameValue.trim()) {
      await renameProjectAction(id, editingNameValue.trim());
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, name: editingNameValue.trim() } : p
        )
      );
    }
    setEditingProjectId(null);
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentlyEdited = [...projects].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0];

  return (
    <div className="min-h-screen bg-background text-text flex flex-col select-none">
      {/* Top Header */}
      <header className="h-16 border-b border-cardBorder bg-card px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-black font-extrabold shadow-md shadow-primary/30">
              SF
            </div>
            <span className="font-extrabold text-base tracking-tight text-white">
              Sound<span className="text-primary">Forge</span>
            </span>
          </Link>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface border border-cardBorder text-text-muted ml-2">
            DAW Studio
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-white">
              {userName || "Producer"}
            </div>
            <div className="text-[11px] text-text-dim">
              {userEmail || "producer@soundforge.app"}
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign Out"
            className="p-2 rounded-lg bg-surface hover:bg-surfaceHover text-text-dim hover:text-white border border-cardBorder transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Welcome & Overview */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Producer Dashboard
            </h1>
            <p className="text-xs text-text-muted mt-1">
              Manage your audio multi-track sessions, recordings, and master exports.
            </p>
          </div>

          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-black font-bold text-xs shadow-lg shadow-primary/20 transition-all active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Project</span>
          </button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Total Projects */}
          <div className="p-5 rounded-2xl bg-card border border-cardBorder flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-text-dim">
                Total Projects
              </span>
              <div className="text-3xl font-black text-white font-mono">
                {projects.length}
              </div>
              <p className="text-[11px] text-text-muted">Multi-track sessions</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Folder className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Recently Edited */}
          <div className="p-5 rounded-2xl bg-card border border-cardBorder flex items-center justify-between">
            <div className="space-y-1 min-w-0 flex-1 mr-3">
              <span className="text-xs font-bold uppercase tracking-wider text-text-dim">
                Recently Edited
              </span>
              <div className="text-base font-bold text-white truncate">
                {recentlyEdited ? recentlyEdited.name : "None yet"}
              </div>
              <p className="text-[11px] text-text-muted">
                {recentlyEdited
                  ? `Updated ${new Date(recentlyEdited.updatedAt).toLocaleDateString()}`
                  : "Start your first project"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center text-accent-blue flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Storage Used */}
          <div className="p-5 rounded-2xl bg-card border border-cardBorder flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-text-dim">
                Storage Used
              </span>
              <HardDrive className="w-4 h-4 text-accent-purple" />
            </div>
            <div className="my-2">
              <div className="flex items-baseline justify-between text-xs mb-1.5">
                <span className="font-bold text-white font-mono">
                  {formatBytes(storageUsedBytes)}
                </span>
                <span className="text-text-dim font-mono">1.0 GB free tier</span>
              </div>
              <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-cardBorder">
                <div
                  className="h-full bg-accent-purple rounded-full transition-all"
                  style={{ width: `${Math.max(4, storagePercent)}%` }}
                />
              </div>
            </div>
            <span className="text-[11px] text-text-dim">
              Supabase cloud audio storage
            </span>
          </div>
        </div>

        {/* Project List / Actions Bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted">
              Your Sessions
            </h2>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-dim" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-card border border-cardBorder rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-text-dim focus:border-primary outline-none"
              />
            </div>
          </div>

          {/* Project Cards Grid */}
          {filteredProjects.length === 0 ? (
            <div className="p-12 rounded-2xl bg-card border border-cardBorder text-center space-y-4">
              <Folder className="w-12 h-12 text-text-dim mx-auto stroke-1" />
              <div>
                <h3 className="text-base font-bold text-white">No projects found</h3>
                <p className="text-xs text-text-muted mt-1">
                  Create a new multi-track session to start recording and producing.
                </p>
              </div>
              <button
                onClick={() => setIsCreating(true)}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-black font-bold text-xs"
              >
                Create Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-card border border-cardBorder hover:border-cardBorder/80 rounded-2xl p-5 flex flex-col justify-between group transition-all shadow-sm hover:shadow-md"
                >
                  {/* Card Header */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      {editingProjectId === project.id ? (
                        <div className="flex items-center gap-1.5 flex-1">
                          <input
                            type="text"
                            value={editingNameValue}
                            onChange={(e) => setEditingNameValue(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleRenameSubmit(project.id)
                            }
                            autoFocus
                            className="bg-surface border border-primary rounded-md px-2 py-1 text-xs text-white w-full outline-none"
                          />
                          <button
                            onClick={() => handleRenameSubmit(project.id)}
                            className="text-primary hover:text-primary-hover p-1"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingProjectId(null)}
                            className="text-text-dim hover:text-white p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-white truncate">
                            {project.name}
                          </h3>
                          <button
                            onClick={() => {
                              setEditingProjectId(project.id);
                              setEditingNameValue(project.name);
                            }}
                            title="Rename Project"
                            className="opacity-0 group-hover:opacity-100 text-text-dim hover:text-white p-1 transition-opacity"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDuplicateProject(project.id)}
                          title="Duplicate Project"
                          className="text-text-dim hover:text-white p-1.5 rounded-lg hover:bg-surface transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteProject(project.id, project.name)
                          }
                          title="Delete Project"
                          className="text-text-dim hover:text-red-400 p-1.5 rounded-lg hover:bg-surface transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-surface border border-cardBorder text-[10px] font-mono text-text-muted">
                        {project.bpm} BPM
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-surface border border-cardBorder text-[10px] font-mono text-text-muted">
                        {project.tracks?.length || 0} Tracks
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-surface border border-cardBorder text-[10px] font-mono text-text-muted">
                        {project.duration}s Timeline
                      </span>
                    </div>
                  </div>

                  {/* Card Footer: Open Studio Button */}
                  <div className="pt-5 mt-4 border-t border-cardBorder/60 flex items-center justify-between">
                    <span className="text-[10px] text-text-dim">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </span>

                    <Link
                      href={`/studio/${project.id}`}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-black font-bold text-xs border border-primary/30 hover:border-primary transition-all"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Open Studio</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Project Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-cardBorder w-full max-w-md rounded-2xl p-6 shadow-2xl relative select-none">
            <button
              onClick={() => setIsCreating(false)}
              className="absolute top-4 right-4 text-text-dim hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-white tracking-tight mb-1">
              New Project
            </h2>
            <p className="text-xs text-text-muted mb-5">
              Set up your audio canvas and tempo.
            </p>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-muted block mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Midnight Groove"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  autoFocus
                  required
                  className="w-full bg-surface border border-cardBorder rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-muted block mb-1">
                  Tempo (BPM)
                </label>
                <input
                  type="number"
                  min="40"
                  max="260"
                  value={newProjectBpm}
                  onChange={(e) => setNewProjectBpm(Number(e.target.value))}
                  className="w-full bg-surface border border-cardBorder rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-primary outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl bg-surface hover:bg-surfaceHover text-text-dim hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-black font-bold text-xs shadow-md shadow-primary/20"
                >
                  Create & Launch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
