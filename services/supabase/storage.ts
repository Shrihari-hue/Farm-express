import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import { supabase } from "./client";

/**
 * Uploads a local image (picked via `expo-image-picker`) to a Supabase
 * Storage bucket and returns its public URL. Reads the file as base64 and
 * decodes to an ArrayBuffer rather than using `fetch(uri).arrayBuffer()` —
 * that pattern is unreliable for `file://` URIs on Android in Hermes.
 *
 * `path` should be farm-scoped, e.g. `${farmId}/${workerId}.jpg`, so the
 * storage RLS policies in `database/storage.sql` (which check
 * `storage.foldername(name)[1] = current_farm_id()`) apply correctly.
 */
export async function uploadImageAsync(params: {
  bucket: string;
  path: string;
  localUri: string;
  contentType?: string;
}): Promise<string> {
  const { bucket, path, localUri, contentType = "image/jpeg" } = params;

  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const { error } = await supabase.storage.from(bucket).upload(path, decode(base64), {
    contentType,
    upsert: true,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteImageAsync(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

/** True for a freshly-picked local file the app still needs to upload,
 * false for an already-hosted `https://` URL. Screens use this to decide
 * whether a worker/expense photo needs an upload step before saving. */
export function isLocalFileUri(uri: string | null | undefined): uri is string {
  return !!uri && !uri.startsWith("http://") && !uri.startsWith("https://");
}
