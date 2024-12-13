"use server";

import { headers } from "next/headers";
import type { Stripe } from "stripe";

import { BookingData } from "@/types/booking";
import { CURRENCY, formatAmountForStripe, stripe } from "@/lib/stripe";

export async function createCheckoutSession(
  data: FormData,
  bookingId: string
): Promise<{ client_secret: string | null; url: string | null }> {
  const ui_mode = data.get(
    "uiMode"
  ) as Stripe.Checkout.SessionCreateParams.UiMode;
  console.log("booking id: ", bookingId);
  const origin: string = (await headers()).get("origin") as string;

  const checkoutSession: Stripe.Checkout.Session =
    await stripe.checkout.sessions.create({
      mode: "payment",
      submit_type: "book",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: CURRENCY,
            product_data: {
              name: "Retreat Booking",
            },
            unit_amount: formatAmountForStripe(
              Number(data.get("price") as string),
              CURRENCY
            ),
          },
        },
      ],
      metadata: { bookingId },
      ...(ui_mode === "hosted" && {
        success_url: `${origin}/checkout/${bookingId}/?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout`,
      }),
      ...(ui_mode === "embedded" && {
        return_url: `${origin}/checkout/${bookingId}/?session_id={CHECKOUT_SESSION_ID}`,
      }),
      ui_mode,
    });

  // console.log("checkout session: ", checkoutSession);

  return {
    client_secret: checkoutSession.client_secret,
    url: checkoutSession.url,
  };
}

export async function createPaymentIntent(
  data: FormData
): Promise<{ client_secret: string }> {
  const paymentIntent: Stripe.PaymentIntent =
    await stripe.paymentIntents.create({
      amount: formatAmountForStripe(
        Number(data.get("customDonation") as string),
        CURRENCY
      ),
      automatic_payment_methods: { enabled: true },
      currency: CURRENCY,
    });

  return { client_secret: paymentIntent.client_secret as string };
}
