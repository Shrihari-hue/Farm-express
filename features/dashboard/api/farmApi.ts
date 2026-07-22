import { supabase } from "@services/supabase/client";
import type { Farm } from "@types/models";

export async function getFarm(farmId: string): Promise<Farm | null> {
  const { data, error } = await supabase.from("farms").select("*").eq("id", farmId).maybeSingle();
  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    ownerId: data.owner_id,
    location: data.location,
    phone: data.phone,
    currency: data.currency,
    language: data.language,
    createdAt: data.created_at,
  };
}
