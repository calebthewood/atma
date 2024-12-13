"use client";

import React, { useState, type JSX } from "react";
import { redirect } from "next/navigation";
import { createBooking } from "@/actions/booking-actions";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";

interface CheckoutFormProps {
  uiMode?: Stripe.Checkout.SessionCreateParams.UiMode;
  price: number;
  userId: string | undefined;
  entity: "retreat" | "program";
  entityId: string;
  propertyId: string;
  checkInDate: Date | undefined;
  checkOutDate: Date | undefined;
  guestCount: number;
}
/** TODO: if userId is undefined, take user to signin then back to checkout */
export default function CheckoutButton({
  uiMode,
  price,
  userId,
  entity,
  entityId,
  propertyId,
  checkInDate,
  checkOutDate,
  guestCount,
}: CheckoutFormProps): JSX.Element {
  const [loading] = useState<boolean>(false);
  const [input, setInput] = useState({ price });
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const formAction = async (data: FormData): Promise<void> => {
    if (userId === undefined) redirect("/authentication"); // TODO: create redirect flow that brings user back to checkout
    if (!checkInDate || !checkOutDate) {
      console.log("failed on dates");
      return;
    }
    const uiMode = data.get(
      "uiMode"
    ) as Stripe.Checkout.SessionCreateParams.UiMode;

    const booking = await createBooking({
      userId,
      entity,
      entityId,
      propertyId,
      checkInDate,
      checkOutDate,
      guestCount,
      totalPrice: String(price),
      status: "checkout-initiated",
    });
    console.log(booking);
    const { client_secret, url } = await createCheckoutSession(
      data,
      booking.id
    );
    if (uiMode === "embedded") return setClientSecret(client_secret);
    window.location.assign(url as string);
  };
  const disabled = !userId || !checkInDate || !checkOutDate;

  return (
    <>
      {userId === undefined ? (
        <Button className="w-min-fit" type="button" disabled={disabled}>
          {userId === undefined ? "Login to book" : "Select dates"}
        </Button>
      ) : (
        <Dialog>
          <form action={formAction}>
            <input type="hidden" name="uiMode" value={uiMode} />
            <input type="hidden" name="price" value={input.price.toString()} />
            <DialogTrigger asChild>
              <Button type="submit" disabled={loading}>
                Book Retreat
              </Button>
            </DialogTrigger>
          </form>
          {clientSecret ? (
            <DialogContent className="max-h-[720px] overflow-auto">
              <DialogHeader>
                <DialogTitle>Checkout</DialogTitle>
                <div className="rounded p-1">
                  <EmbeddedCheckoutProvider
                    stripe={getStripe()}
                    options={{ clientSecret }}
                  >
                    {/* <ScrollArea className="h-[600px]"> */}
                    <EmbeddedCheckout />
                    {/* </ScrollArea> */}
                  </EmbeddedCheckoutProvider>
                </div>
              </DialogHeader>
            </DialogContent>
          ) : null}
        </Dialog>
      )}
    </>
  );
}
