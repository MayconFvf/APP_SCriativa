import { supabase } from "./supabase";

export const ART_MODELS_BUCKET = "artes-modelos";

function requireSupabaseStorage() {
  if (!supabase) {
    throw new Error("Supabase não configurado.");
  }

  return supabase.storage.from(ART_MODELS_BUCKET);
}

function getImageExtension(file: File) {
  const extensionFromName = file.name.split(".").pop()?.toLowerCase();
  if (extensionFromName && /^[a-z0-9]+$/.test(extensionFromName)) return extensionFromName;

  const extensionFromType = file.type.split("/").pop()?.toLowerCase();
  return extensionFromType || "webp";
}

function createImagePath(file: File) {
  const date = new Date();
  const folder = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}`;
  const extension = getImageExtension(file);
  const id = crypto.randomUUID();

  return `${folder}/${Date.now()}-${id}.${extension}`;
}

export async function uploadArtModelImage(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("O arquivo selecionado precisa ser uma imagem.");
  }

  const storage = requireSupabaseStorage();
  const path = createImagePath(file);
  const { error } = await storage.upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false
  });

  if (error) throw error;

  const { data } = storage.getPublicUrl(path);
  return {
    path,
    publicUrl: data.publicUrl
  };
}

export function getArtModelStoragePathFromUrl(url?: string | null) {
  if (!url) return null;

  const marker = `/object/public/${ART_MODELS_BUCKET}/`;
  const markerIndex = url.indexOf(marker);

  if (markerIndex === -1) return null;

  const rawPath = url.slice(markerIndex + marker.length).split("?")[0];
  return decodeURIComponent(rawPath);
}

export async function deleteArtModelImageByUrl(url?: string | null) {
  const path = getArtModelStoragePathFromUrl(url);
  if (!path) return;

  const storage = requireSupabaseStorage();
  const { error } = await storage.remove([path]);

  if (error) throw error;
}
