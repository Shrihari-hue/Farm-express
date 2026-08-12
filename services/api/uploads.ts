import { ENV } from "@constants/config";
import { getToken } from "./tokenStorage";

/**
 * Uploads a local worker photo (picked via `expo-image-picker`) to the new
 * backend's `POST /api/uploads/worker-photo` endpoint as multipart
 * form-data, and returns the hosted URL to store on `Worker.photoUrl`.
 *
 * React Native's `fetch`/`FormData` support file-shaped values natively —
 * `{ uri, name, type }` — so no base64 round-trip is needed here (that was
 * only required for the old Supabase Storage SDK call).
 */
export async function uploadWorkerPhoto(workerId: string, localUri: string): Promise<string> {
  const token = await getToken();

  const formData = new FormData();
  // React Native's FormData accepts this file-shaped object even though it
  // doesn't match the DOM `Blob`/`File` types TypeScript expects here.
  formData.append("file", {
    uri: localUri,
    name: "photo.jpg",
    type: "image/jpeg",
  } as unknown as Blob);
  formData.append("workerId", workerId);

  const response = await fetch(`${ENV.apiUrl}/api/uploads/worker-photo`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Deliberately no Content-Type — fetch sets the multipart boundary
      // itself when the body is a FormData instance.
    },
    body: formData,
  });

  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    const message =
      body && typeof body === "object" && body !== null && "error" in body && typeof (body as { error?: unknown }).error === "string"
        ? (body as { error: string }).error
        : response.statusText || "Upload failed";
    throw new Error(message);
  }

  return (body as { url: string }).url;
}

/** True for a freshly-picked local file the app still needs to upload,
 * false for an already-hosted `http(s)://` URL. Screens use this to decide
 * whether a worker photo needs an upload step before saving. */
export function isLocalFileUri(uri: string | null | undefined): uri is string {
  return !!uri && !uri.startsWith("http://") && !uri.startsWith("https://");
}
