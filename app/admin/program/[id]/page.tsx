// app/admin/program/[id]/page.tsx
import { redirect } from "next/navigation";
import { createProgram } from "@/actions/program-actions";
import { auth } from "@/auth";

import prisma from "@/lib/prisma";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProgramRedirectPage({ params }: PageProps) {
  const { id } = await params;
  // If id is not '000', redirect back to program list
  if (id !== "000") {
    redirect("/admin/program");
  }

  // Get the authenticated user's session
  const session = await auth();
  if (!session?.user?.hostId) {
    throw new Error("No host ID found for user");
  }

  const property = await prisma.property.findFirst({
    where: { hostId: session.user.hostId },
    select: { id: true },
  });

  if (!property) {
    // Redirect to property creation if no properties exist
    redirect("/admin/property/000?redirectTo=program");
  }

  const result = await createProgram({
    propertyId: property.id,
    hostId: session.user.hostId,
  });

  if (!result.ok || !result.data) {
    throw new Error(result.message);
  }

  // Redirect to the edit page for the new program
  return redirect(`/admin/program/${result.data.id}/general`);
}
