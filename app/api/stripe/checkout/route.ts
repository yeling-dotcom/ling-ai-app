import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { getOrganizationForUser } from "@/lib/organization";

/**
 * POST /api/stripe/checkout
 * Body: { priceId: string, successUrl?: string, cancelUrl?: string }
 *
 * Creates a Stripe Checkout Session for the authenticated user.
 * Respects Connect platform fee if STRIPE_PLATFORM_FEE_PERCENT is set.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { priceId, successUrl, cancelUrl } = body as {
      priceId: string;
      successUrl?: string;
      cancelUrl?: string;
    };

    if (!priceId) {
      return NextResponse.json({ error: "priceId is required" }, { status: 400 });
    }

    const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "";

    const context = await getOrganizationForUser();
    if (!context || context.role !== "owner") return NextResponse.json({ error: "Only the organization owner can manage billing." }, { status: 403 });
    const allowedPrices = [process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY, process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY].filter(Boolean);
    if (!process.env.STRIPE_SECRET_KEY || !allowedPrices.includes(priceId)) return NextResponse.json({ error: "Stripe billing is not configured for this price." }, { status: 503 });

    const session = await createCheckoutSession({
      priceId,
      customerId: context.organization.stripe_customer_id ?? undefined,
      userId: user.id,
      organizationId: context.organization.id,
      successUrl: successUrl ?? `${origin}/admin/billing?checkout=success`,
      cancelUrl: cancelUrl ?? `${origin}/admin/billing?checkout=canceled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
