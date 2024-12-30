import prisma from "@/lib/prisma";

export default async function Page() {
  // Add this to a maintenance endpoint or script
  async function cleanupOldSessions() {
    const expired = new Date();
    expired.setDate(expired.getDate() - 30); // 30 days ago

    return await prisma.session.deleteMany({
      where: {
        expires: {
          lt: expired,
        },
      },
    });
  }

  const res = await cleanupOldSessions();

  return <>{res.count} Sessions Deleted</>;
}
