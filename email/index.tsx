import { Resend } from "resend";

import { APP_NAME, SENDER_EMAIL } from "@/lib/constants";
import type { Order } from "@/types";
import PurchaseReceiptEmail from "./purchase-receipt";

export const sendPurchaseReceipt = async ({ order }: { order: Order }) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // In build or environments without email configured, skip sending
    console.warn("RESEND_API_KEY is not set; skipping purchase receipt email.");
    return;
  }

  const resend = new Resend(apiKey);

  await resend.emails.send({
    from: `${APP_NAME} <${SENDER_EMAIL}>`,
    to: order.user.email,
    subject: `Order Confirmation ${order.id}`,
    react: PurchaseReceiptEmail({ order }),
  });
};
