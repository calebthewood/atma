"use client";

import React, { useState } from "react";
import { redirect } from "next/navigation";
import {
  createProgramBooking,
  createRetreatBooking,
} from "@/actions/booking-actions";
import { createCheckoutSession } from "@/actions/stripe";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import type Stripe from "stripe";

import getStripe from "@/lib/getStripe";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "../ui/button";

interface CheckoutFormProps {
  uiMode?: Stripe.Checkout.SessionCreateParams.UiMode;
  hostId: string;
  propertyId: string;
  price: number;
  userId: string | undefined;
  entity: "retreat" | "program";
  entityId: string;
  checkInDate: Date | undefined;
  checkOutDate: Date | undefined;
  guestCount: number;
}
/** TODO: if userId is undefined, take user to signin then back to checkout */
export default function CheckoutButton({
  uiMode,
  hostId,
  propertyId,
  price,
  userId,
  entity,
  entityId,
  checkInDate,
  checkOutDate,
  guestCount,
}: CheckoutFormProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [input, _] = useState({ price });
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createBookingRecord = async ({ userId }: { userId: string }) => {
    try {
      if (entity === "retreat") {
        console.log("creating retreat booking");
        return await createRetreatBooking({
          userId,
          hostId,
          propertyId,
          retreatInstanceId: entityId,
          checkInDate: checkInDate?.toDateString() || "",
          checkOutDate: checkOutDate?.toDateString() || "",
          guestCount,
          totalPrice: String(price),
          status: "checkout-initiated",
        });
      } else {
        return await createProgramBooking({
          userId,
          hostId,
          propertyId,
          programInstanceId: entityId,
          checkInDate: checkInDate?.toDateString() || "",
          checkOutDate: checkOutDate?.toDateString() || "",
          guestCount,
          totalPrice: String(price),
          status: "checkout-initiated",
        });
      }
    } catch (err) {
      throw new Error(`Failed to create ${entity} booking: ${err}`);
    }
  };

  const formAction = async (data: FormData): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      if (userId === undefined) {
        redirect("/authentication"); // TODO: create redirect flow that brings user back to checkout
      }

      if (!checkInDate || !checkOutDate) {
        throw new Error("Please select check-in and check-out dates");
      }

      const uiMode = data.get(
        "uiMode"
      ) as Stripe.Checkout.SessionCreateParams.UiMode;

      const booking = await createBookingRecord({ userId });

      if (!booking.data) {
        throw new Error(booking.message);
      }

      const { client_secret, url } = await createCheckoutSession(
        data,
        booking.data.id
      );

      if (uiMode === "embedded") {
        setClientSecret(client_secret);
      } else {
        window.location.assign(url as string);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const disabled = !userId || !checkInDate || !checkOutDate;

  return (
    <>
      {userId === undefined ? (
        <Button className="w-min-fit" type="button" disabled={disabled}>
          Login to book
        </Button>
      ) : (
        <Dialog>
          <form action={formAction}>
            <input type="hidden" name="uiMode" value={uiMode} />
            <input type="hidden" name="price" value={input.price.toString()} />
            <DialogTrigger asChild>
              <Button type="submit" disabled={loading}>
                {loading
                  ? "Processing..."
                  : `Book ${entity === "retreat" ? "Retreat" : "Program"}`}
              </Button>
            </DialogTrigger>
          </form>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          {clientSecret && (
            <DialogContent className="max-h-[720px] overflow-auto">
              <DialogHeader>
                <DialogTitle>Checkout</DialogTitle>
                <div className="rounded p-1">
                  <EmbeddedCheckoutProvider
                    stripe={getStripe()}
                    options={{ clientSecret }}
                  >
                    <EmbeddedCheckout />
                  </EmbeddedCheckoutProvider>
                </div>
              </DialogHeader>
            </DialogContent>
          )}
        </Dialog>
      )}
    </>
  );
}
