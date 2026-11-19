import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseKey &&
    supabaseUrl !== "your_supabase_project_url" &&
    supabaseKey !== "your_supabase_anon_key"
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

/**
 * Uploads an audio Blob or Buffer to Supabase Storage, or falls back to internal storage
 * Returns the public URL for playback in Wavesurfer and Web Audio API
 */
export async function uploadAudio(
  fileBlob: Blob,
  fileName: string,
  bucketName = "audio-clips"
): Promise<{ url: string; path: string; error?: string }> {
  try {
    if (isSupabaseConfigured && supabase) {
      const buffer = await fileBlob.arrayBuffer();
      const uniqueName = `${Date.now()}-${fileName.replace(/\s+/g, "_")}`;
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(uniqueName, buffer, {
          contentType: fileBlob.type || "audio/wav",
          upsert: true,
        });

      if (error) {
        console.warn("Supabase upload error, falling back to local API storage:", error.message);
      } else if (data) {
        const { data: publicData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(data.path);
        return {
          url: publicData.publicUrl,
          path: data.path,
        };
      }
    }

    // Fallback: Upload to Next.js API storage route
    const formData = new FormData();
    formData.append("file", fileBlob, fileName);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Upload failed with status: ${res.status}`);
    }

    const json = await res.json();
    return {
      url: json.url,
      path: json.path || fileName,
    };
  } catch (err: any) {
    console.error("Audio upload failed:", err);
    // If client-side and all else fails, generate a persistent object URL or data URL
    const fallbackUrl = URL.createObjectURL(fileBlob);
    return {
      url: fallbackUrl,
      path: fileName,
      error: err.message,
    };
  }
}
