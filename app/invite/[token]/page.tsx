import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function InvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const token = (await params).token;
  if (!user) redirect(`/login?next=/invite/${token}`);
  const { error } = await supabase.rpc("accept_organization_invitation", { invitation_token: token });
  return <main><section className="hero"><p className="eyebrow">Team invitation</p><h1>{error ? "Invitation could not be accepted." : "You joined the team."}</h1><p className="lede">{error ? "Check that you signed in with the invited email and that the link has not expired." : "You can now open Studio and collaborate."}</p><a className="primary-button" href="/admin/posts">Open Studio</a></section></main>;
}
