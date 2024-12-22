import { NextResponse } from "next/server";
import { createBooking, updateBookingStatus } from "@/actions/booking-actions";
import type { Stripe } from "stripe";

import { sendEmail } from "@/lib/sendgrid";
import { stripe } from "@/lib/stripe";

/* ReadMe
  to test locally, run "stripe listen --forward-to localhost:3000/api/webhooks" in
  the terminal, this establishes a 'local listener' connected to your stripe dashboard.
  you can verify this by checking the local listener STATUS here: https://dashboard.stripe.com/test/webhooks
  otherwise your local dev app wont receive events when going thru the checkout process.
*/
export async function POST(req: Request) {
  let event: Stripe.Event;

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") as string;

    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    // On error, log and return the error message.
    if (err! instanceof Error) console.log(err);
    console.log(`❌ Error message: ${errorMessage}`);
    return NextResponse.json(
      { message: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    );
  }

  // Successfully constructed event.
  console.log("✅ Success:", event?.id);

  const permittedEvents: string[] = [
    "checkout.session.completed",
    "payment_intent.succeeded",
    "payment_intent.payment_failed",
    "charge.updated",
    "booking",
    "checkout.session.completed",
  ];

  if (permittedEvents.includes(event.type)) {
    let data;
    console.log("[event.data.object] ", event.data.object);
    try {
      switch (event.type) {
        case "checkout.session.completed":
          data = event.data.object as Stripe.Checkout.Session;
          console.log(`💰 CheckoutSession status: ${data.payment_status}`);

          if (data.metadata) {
            const bookingId = data.metadata.bookingId;
            const res = await updateBookingStatus(bookingId, "completed");

            if (res) {
              console.log(`💰💰 Booking status: completed`);
            }
          }

          break;
        case "payment_intent.payment_failed":
          data = event.data.object as Stripe.PaymentIntent;
          console.log(`❌ Payment failed: ${data.last_payment_error?.message}`);
          break;
        case "payment_intent.succeeded":
          data = event.data.object as Stripe.PaymentIntent;
          console.log(`💰 PaymentIntent status: ${data.status}`);
          break;
        default:
          throw new Error(`Unhandled event: ${event.type}`);
      }
    } catch (error) {
      console.log(error);
      return NextResponse.json(
        { message: "Webhook handler failed" },
        { status: 500 }
      );
    }
  }
  // Return a response to acknowledge receipt of the event.
  return NextResponse.json({ message: "Received" }, { status: 200 });
}
