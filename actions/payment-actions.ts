"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

export async function createPayment(data: {
  bookingId: string;
  paymentDate: Date;
  amount: string;
  status: string;
}) {
  try {
    const payment = await prisma.payment.create({
      data: {
        bookingId: data.bookingId,
        paymentDate: data.paymentDate,
        amount: data.amount,
        status: data.status,
      },
    });

    revalidatePath("/payments");

    return payment;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw new Error("Failed to create payment");
  }
}

export async function getPayments() {
  try {
    const payments = await prisma.payment.findMany();
    return payments;
  } catch (error) {
    console.error("Error fetching payments:", error);
    throw new Error("Failed to fetch payments");
  }
}

export async function getPaymentById(paymentId: string) {
  try {
    const payment = await prisma.payment.findUnique({
      where: {
        id: paymentId,
      },
    });

    if (!payment) {
      throw new Error("Payment not found");
    }

    return payment;
  } catch (error) {
    console.error(`Error fetching payment with id ${paymentId}:`, error);
    throw new Error(`Failed to fetch payment with id ${paymentId}`);
  }
}

export async function updatePayment(
  paymentId: string,
  data: {
    bookingId?: string;
    paymentDate?: Date;
    amount?: string;
    status?: string;
  }
) {
  try {
    const payment = await prisma.payment.update({
      where: {
        id: paymentId,
      },
      data,
    });

    revalidatePath(`/payments/${paymentId}`);

    return payment;
  } catch (error) {
    console.error(`Error updating payment with id ${paymentId}:`, error);
    throw new Error(`Failed to update payment with id ${paymentId}`);
  }
}

export async function deletePayment(paymentId: string) {
  try {
    const payment = await prisma.payment.delete({
      where: {
        id: paymentId,
      },
    });

    revalidatePath("/payments");

    return payment;
  } catch (error) {
    console.error(`Error deleting payment with id ${paymentId}:`, error);
    throw new Error(`Failed to delete payment with id ${paymentId}`);
  }
}
