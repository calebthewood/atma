"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createUser(data: {
  fname: string;
  lname: string;
  username: string;
  email?: string;
  phone: string;
  role?: string;
  image?: string;
}) {
  const user = await prisma.user.create({
    data: {
      fname: data.fname,
      lname: data.lname,
      username: data.username,
      email: data.email,
      phone: data.phone,
      role: data.role || "user",
      image: data.image,
    },
  });

  revalidatePath("/users");

  return user;
}

export async function getUsers() {
  const users = await prisma.user.findMany();
  return users;
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  return user;
}

export async function updateUser(userId: string, data: {
  fname?: string;
  lname?: string;
  username?: string;
  email?: string;
  phone?: string;
  role?: string;
  image?: string;
}) {
  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data,
  });

  revalidatePath(`/users/${userId}`);

  return user;
}

export async function deleteUser(userId: string) {
  const user = await prisma.user.delete({
    where: {
      id: userId,
    },
  });

  revalidatePath("/users");

  return user;
}