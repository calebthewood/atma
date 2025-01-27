"use server";

import prisma from "@/lib/prisma";

export async function getDatabaseCounts(): Promise<{
  userCount: number;
  hostCount: number;
  propertyCount: number;
  verifiedPropertyCount: number;
  retreatCount: number;
  verifiedRetreatCount: number;
  programCount: number;
  verifiedProgramCount: number;
}> {
  try {
    const [
      userCount,
      hostCount,
      propertyCount,
      verifiedPropertyCount,
      retreatCount,
      verifiedRetreatCount,
      programCount,
      verifiedProgramCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.host.count(),
      prisma.property.count(),
      prisma.property.count({
        where: {
          verified: {
            not: null,
          },
        },
      }),
      prisma.retreat.count(),
      prisma.retreat.count({
        where: {
          verified: {
            not: null,
          },
        },
      }),
      prisma.program.count(),
      prisma.program.count({
        where: {
          verified: {
            not: null,
          },
        },
      }),
    ]);

    return {
      userCount,
      hostCount,
      propertyCount,
      verifiedPropertyCount,
      retreatCount,
      verifiedRetreatCount,
      programCount,
      verifiedProgramCount,
    };
  } catch (error) {
    console.log("Error fetching database counts:", error);
    throw new Error("Failed to fetch database counts");
  }
}
