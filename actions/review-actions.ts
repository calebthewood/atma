"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

// export async function createReview(data: {
//   userId: string;
//   rating: number;
//   propertyId: string;
// }) {
//   try {
//     const review = await prisma.review.create({
//       data: {
//         userId: data.userId,
//         rating: data.rating,
//         propertyId: data.propertyId,
//       },
//     });

//     revalidatePath("/reviews");

//     return review;
//   } catch (error) {
//     console.log("Error creating review:", error);
//     throw new Error("Failed to create review");
//   }
// }

export async function getReviews() {
  try {
    const reviews = await prisma.review.findMany();
    return reviews;
  } catch (error) {
    console.log("Error fetching reviews:", error);
    throw new Error("Failed to fetch reviews");
  }
}

export async function getReviewById(reviewId: string) {
  try {
    const review = await prisma.review.findUnique({
      where: {
        id: reviewId,
      },
    });

    if (!review) {
      throw new Error("Review not found");
    }

    return review;
  } catch (error) {
    console.log(`Error fetching review with id ${reviewId}:`, error);
    throw new Error(`Failed to fetch review with id ${reviewId}`);
  }
}

export async function updateReview(
  reviewId: string,
  data: {
    userId?: string;
    rating?: number;
    propertyId?: string;
  }
) {
  try {
    const review = await prisma.review.update({
      where: {
        id: reviewId,
      },
      data,
    });

    revalidatePath(`/reviews/${reviewId}`);

    return review;
  } catch (error) {
    console.log(`Error updating review with id ${reviewId}:`, error);
    throw new Error(`Failed to update review with id ${reviewId}`);
  }
}

export async function deleteReview(reviewId: string) {
  try {
    const review = await prisma.review.delete({
      where: {
        id: reviewId,
      },
    });

    revalidatePath("/reviews");

    return review;
  } catch (error) {
    console.log(`Error deleting review with id ${reviewId}:`, error);
    throw new Error(`Failed to delete review with id ${reviewId}`);
  }
}
