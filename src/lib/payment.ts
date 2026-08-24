import "server-only";
import crypto from "crypto";

// Integrasi pembayaran Tripay (https://tripay.co.id).
// Jika env Tripay belum diisi, sistem otomatis memakai mode SIMULASI
// agar alur order -> bayar -> aktivasi tetap bisa dites di development.

const API_BASE = process.env.TRIPAY_MODE === "production"
  ? "https://tripay.co.id/api"
  : "https://tripay.co.id/api-sandbox";

export function paymentMode(): "TRIPAY" | "SIMULASI" {
  return process.env.TRIPAY_API_KEY && process.env.TRIPAY_PRIVATE_KEY && process.env.TRIPAY_MERCHANT_CODE
    ? "TRIPAY"
    : "SIMULASI";
}

export const PAYMENT_CHANNELS = [
  { code: "QRIS", name: "QRIS (semua e-wallet)", fee: 0.007 },
  { code: "BRIVA", name: "BRI Virtual Account", fee: 4000 },
  { code: "BCAVA", name: "BCA Virtual Account", fee: 4000 },
  { code: "BNIVA", name: "BNI Virtual Account", fee: 4000 },
  { code: "ALFAMART", name: "Alfamart / Alfamidi", fee: 5000 },
  { code: "INDOMARET", name: "Indomaret", fee: 5000 },
];

export interface TripayTransactionResult {
  ok: boolean;
  checkoutUrl?: string;
  payRef?: string;
  method?: string;
  instructions?: string;
}

function sign(amount: number, merchantRef: string) {
  return crypto
    .createHmac("sha512", process.env.TRIPAY_PRIVATE_KEY as string)
    .update(`${process.env.TRIPAY_MERCHANT_CODE}${merchantRef}${amount}`)
    .digest("hex");
}

export async function createPayment(opts: {
  orderId: string;
  amount: number;
  method: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
}): Promise<TripayTransactionResult> {
  if (paymentMode() === "SIMULASI") {
    return {
      ok: true,
      method: "SIMULASI",
      instructions:
        "Mode simulasi aktif (env Tripay belum diisi). Buka halaman pesanan lalu klik 'Simulasikan Pembayaran' untuk mengaktifkan undangan.",
    };
  }

  const payload = {
    method: opts.method,
    merchant_ref: opts.orderId,
    amount: opts.amount,
    customer_name: opts.customerName,
    customer_email: opts.customerEmail,
    customer_phone: opts.customerPhone || "",
    order_items: [{ name: `Undangan Digital ${opts.orderId}`, price: opts.amount, quantity: 1 }],
    signature: sign(opts.amount, opts.orderId),
  };

  try {
    const res = await fetch(`${API_BASE}/transaction/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.TRIPAY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) {
      return { ok: false, instructions: json.message || "Gagal membuat transaksi" };
    }
    const d = json.data;
    return {
      ok: true,
      checkoutUrl: d.checkout_url,
      payRef: d.reference,
      method: opts.method,
      instructions: d.pay_code ? `Kode bayar: ${d.pay_code}` : undefined,
    };
  } catch {
    return { ok: false, instructions: "Gagal terhubung ke server pembayaran" };
  }
}

/** Verifikasi callback dari Tripay. Signature = HMAC-SHA512(rawBody, privateKey). */
export function verifyCallbackSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;
  const expected = crypto
    .createHmac("sha512", process.env.TRIPAY_PRIVATE_KEY as string)
    .update(rawBody)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}
