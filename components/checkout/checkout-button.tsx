"use client";

import type Stripe from "stripe";

import React, { useState } from "react";

import { Button } from "../ui/button";

import { formatAmountForDisplay, CURRENCY, stripe } from "@/lib/stripe";
import { createCheckoutSession } from "@/actions/stripe";
import getStripe from "@/lib/getStripe";

import {
    EmbeddedCheckout,
    EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "../ui/scroll-area";



interface CheckoutFormProps {
    uiMode?: Stripe.Checkout.SessionCreateParams.UiMode;
    price: number;
}

export default function CheckoutButton(props: CheckoutFormProps): JSX.Element {
    const [loading] = useState<boolean>(false);
    const [input, setInput] = useState({ price: props.price });
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    const formAction = async (data: FormData): Promise<void> => {
        const uiMode = data.get(
            "uiMode",
        ) as Stripe.Checkout.SessionCreateParams.UiMode;
        const { client_secret, url } = await createCheckoutSession(data);

        if (uiMode === "embedded") return setClientSecret(client_secret);

        window.location.assign(url as string);
    };

    return (
        <>
            <Dialog>
                <form action={formAction}>
                    <input type="hidden" name="uiMode" value={props.uiMode} />
                    <input type="hidden" name="price" value={input.price.toString()} />
                    <DialogTrigger asChild>
                        <Button
                            className="w-full"
                            type="submit"
                            disabled={loading}
                        >
                            Book Retreat
                        </Button>
                    </DialogTrigger>
                </form>
                {clientSecret ? (
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Checkout</DialogTitle>
                            <DialogDescription className="rounded">
                                <EmbeddedCheckoutProvider
                                    stripe={getStripe()}
                                    options={{ clientSecret }}
                                >
                                    <ScrollArea className="h-[600px]">
                                        <EmbeddedCheckout />
                                    </ScrollArea>
                                </EmbeddedCheckoutProvider>
                            </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                ) : null}
            </Dialog>
        </>
    );
}