import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { updateOrderToPaid } from "@/lib/actions/order.actions";

// Define the POST handler function for the Stripe webhook
export async function POST(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // If Stripe is not configured, don't crash the app during build/runtime
  if (!secretKey || !webhookSecret) {
    console.warn(
      "Stripe webhook called but STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET is not set; skipping."
    );
    return NextResponse.json(
      { message: "Stripe webhook not configured" },
      { status: 200 }
    );
  }

  const stripe = new Stripe(secretKey);

  // Construct the event using the raw request body, the Stripe signature header, and the webhook secret.
  // This ensures that the request is indeed from Stripe and has not been tampered with.
  const event = await stripe.webhooks.constructEvent(
    await req.text(),
    req.headers.get("stripe-signature") as string,
    webhookSecret
  );

  // charge.succeeded indicates a successful payment
  if (event.type === "charge.succeeded") {
    // Retrieve the order ID from the payment metadata
    const { object } = event.data as any;

    // Update the order status to paid
    await updateOrderToPaid({
      orderId: object.metadata.orderId,
      paymentResult: {
        id: object.id,
        status: "COMPLETED",
        email_address: object.billing_details.email!,
        pricePaid: (object.amount / 100).toFixed(),
      },
    });

    return NextResponse.json({
      message: "updateOrderToPaid was successful",
    });
  }

  return NextResponse.json({
    message: "event is not charge.succeeded",
  });
}
