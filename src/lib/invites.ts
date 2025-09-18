import { prisma } from "@/lib/prisma";
import { createServiceClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";

export async function createInviteToken(email: string, createdById: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const inviteToken = await prisma.invite_tokens.create({
    data: {
      id: `invite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email,
      token,
      expiresAt,
      createdById,
    },
  });

  return inviteToken;
}

export async function validateInviteToken(token: string) {
  const inviteToken = await prisma.invite_tokens.findUnique({
    where: { token },
  });

  if (!inviteToken) {
    return { valid: false, error: "Invalid token" };
  }

  if (inviteToken.consumedAt) {
    return { valid: false, error: "Token already used" };
  }

  if (inviteToken.expiresAt < new Date()) {
    return { valid: false, error: "Token expired" };
  }

  return { valid: true, inviteToken };
}

export async function consumeInviteToken(token: string) {
  await prisma.invite_tokens.update({
    where: { token },
    data: { consumedAt: new Date() },
  });
}

export async function sendMagicLink(email: string, inviteToken: string) {
  // In local development with mock Supabase, provide direct invite URL
  if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('/api/mock')) {
    console.log(`[MOCK] Magic link would be sent to ${email}`);
    console.log(`[MOCK] Direct invite URL: ${process.env.NEXTAUTH_URL}/invite/accept?token=${inviteToken}`);
    return;
  }

  const supabase = await createServiceClient();

  // Magic link will redirect to auth callback, which will then redirect to onboarding
  const redirectTo = `${process.env.NEXTAUTH_URL}/auth/callback?next=/onboarding`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
    },
  });

  if (error) {
    throw new Error(`Failed to send magic link: ${error.message}`);
  }
}