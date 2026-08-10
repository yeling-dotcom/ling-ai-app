import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export type Organization = {
  id: string;
  owner_user_id: string;
  name: string;
  slug: string;
  plan: "free" | "pro";
  stripe_customer_id: string | null;
};

export type OrganizationSettings = {
  organization_id: string;
  theme: "editorial" | "garden" | "minimal";
  gallery_enabled: boolean;
  videos_enabled: boolean;
  contact_enabled: boolean;
  analytics_enabled: boolean;
  ai_review_enabled: boolean;
};

export type OrganizationContext = {
  organization: Organization;
  settings: OrganizationSettings;
  role: "owner" | "editor" | "reviewer";
};

const defaultSettings = (organizationId: string): OrganizationSettings => ({
  organization_id: organizationId,
  theme: "editorial",
  gallery_enabled: true,
  videos_enabled: true,
  contact_enabled: true,
  analytics_enabled: true,
  ai_review_enabled: true,
});

export async function getOrganizationForUser(): Promise<OrganizationContext | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const activeOrganizationId = (await cookies()).get("active_organization_id")?.value;

  let membershipQuery = supabase
    .from("organization_members")
    .select("organization_id,role")
    .eq("user_id", user.id);
  if (activeOrganizationId) membershipQuery = membershipQuery.eq("organization_id", activeOrganizationId);
  const { data: membership } = await membershipQuery.order("created_at", { ascending: true }).limit(1).maybeSingle();
  if (!membership) return null;

  const [{ data: organization }, { data: settings }] = await Promise.all([
    supabase.from("organizations").select("*").eq("id", membership.organization_id).single(),
    supabase.from("organization_settings").select("*").eq("organization_id", membership.organization_id).maybeSingle(),
  ]);
  if (!organization) return null;
  return {
    organization: organization as Organization,
    settings: (settings as OrganizationSettings | null) ?? defaultSettings(organization.id),
    role: membership.role as OrganizationContext["role"],
  };
}

export async function getPublicOrganization(requestedSlug?: string): Promise<Omit<OrganizationContext, "role"> | null> {
  const supabase = await createClient();
  const slug = requestedSlug ?? process.env.NEXT_PUBLIC_DEFAULT_ORG_SLUG ?? "ling";
  const { data: rows } = await supabase.rpc("public_organization_by_slug", { requested_slug: slug });
  const organization = Array.isArray(rows) ? rows[0] : rows;
  if (!organization) return null;
  const { data: settings } = await supabase.from("organization_settings").select("*").eq("organization_id", organization.id).maybeSingle();
  return {
    organization: { ...organization, owner_user_id: "", plan: "free", stripe_customer_id: null } as Organization,
    settings: (settings as OrganizationSettings | null) ?? defaultSettings(organization.id),
  };
}

export function canManageOrganization(context: OrganizationContext) {
  return context.role === "owner";
}

export function planLimits(plan: Organization["plan"]) {
  return plan === "pro"
    ? { members: 10, themes: ["editorial", "garden", "minimal"] as const, aiReview: true }
    : { members: 1, themes: ["editorial"] as const, aiReview: false };
}
