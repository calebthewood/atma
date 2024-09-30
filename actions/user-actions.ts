"use server";

import { revalidatePath } from "next/cache";
import { uploadToS3 } from "@/lib/s3";


import { prisma } from "@/lib/prisma";





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
      name: data.fname + " " + data.lname, // weird fix for google auth which require 'name'
      username: data.username,
      email: data.email,
      phone: data.phone,
      role: data.role || "user",
      image: data.image,
    },
  });
  return user;
}

export async function getUsers() {
  const users = await prisma.user.findMany();
  return users;
}

interface EmailQuery {
  email: string;
}
interface IdQuery {
  id: string;
}
interface PhoneQuery {
  phone: string;
}
type UserQuery = EmailQuery | IdQuery | PhoneQuery;

export async function getUser(query: UserQuery) {
  if (!query) return null;

  const user = await prisma.user.findUnique({
    where: query,
  });

  return user;
}

export async function updateUser(
  userId: string,
  data: {
    fname?: string;
    lname?: string;
    username?: string;
    email?: string;
    phone?: string;
    role?: string;
    image?: string;
  }
) {
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
  })

  revalidatePath("/users")

  return user
}

export async function uploadImage(formData: FormData) {
  const file = formData.get("image") as File
  if (!file) {
    return { success: false, error: "No file provided" }
  }

  try {
    // Assuming uploadToS3 returns the URL of the uploaded image
    const url = await uploadToS3(file, 'users')

    // Here you might want to save the URL to your database
    // await saveImageUrlToDatabase(url);

    revalidatePath("/") // Revalidate the current page

    return { success: true, url }
  } catch (error) {
    console.error("Error uploading image:", error)
    return { success: false, error: "Failed to upload image" }
  }
}