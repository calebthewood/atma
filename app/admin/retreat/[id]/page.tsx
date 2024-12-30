// app/admin/retreat/[id]/page.tsx
import { redirect } from "next/navigation";
import { createRetreat } from "@/actions/retreat-actions";
import { auth } from "@/auth";

import prisma from "@/lib/prisma";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RetreatRedirectPage({ params }: PageProps) {
  const { id } = await params;
  // If id is not '000', redirect back to retreat list
  if (id !== "000") {
    redirect("/admin/retreat");
  }

  // Get the authenticated user's session
  const session = await auth();
  if (!session?.user?.hostId) {
    throw new Error("No host ID found for user");
  }

  // Get the first property for this host
  const property = await prisma.property.findFirst({
    where: { hostId: session.user.hostId },
    select: { id: true },
  });
  console.log("property", property);
  if (!property) {
    // Redirect to property creation if no properties exist
    redirect("/admin/property/000?redirectTo=retreat");
  }

  // Create a new retreat with just the required propertyId
  const result = await createRetreat({
    propertyId: property.id,
    hostId: session.user.hostId,
  });

  console.log("RESULT", result);
  if (!result.ok || !result.data) {
    throw new Error(result.message);
  }

  // Redirect to the edit page for the new retreat
  return redirect(`/admin/retreat/${result.data.id}/general`);
}
