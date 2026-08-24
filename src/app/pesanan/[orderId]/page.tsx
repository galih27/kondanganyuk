import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { paymentMode } from "@/lib/payment";
import { PLANS } from "@/lib/plans";
import { OrderClient } from "@/components/dashboard/order-client";
import { formatDateTimeID } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PesananPage({ params }: { params: Promise<{ orderId: string }> }) {
  const user = await getSessionUser();
  if (!user) return null;
  const { orderId } = await params;

  const payment = await db.payment.findUnique({
    where: { orderId },
    include: { invitation: true },
  });
  if (!payment || payment.userId !== user.id) notFound();

  const plan = PLANS[payment.plan as keyof typeof PLANS];

  // Jika sudah dibayar & ada checkout URL Tripay yang belum dikunjungi, tetap tampilkan status
  if (payment.status === "PAID" && payment.invitationId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-white px-4">
        <div className="w-full max-w-md rounded-3xl border border-green-200 bg-white p-8 text-center shadow-xl">
          <p className="text-5xl">🎉</p>
          <h1 className="mt-4 text-2xl font-bold text-stone-900">Pembayaran Berhasil!</h1>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Undangan <strong>{payment.invitation?.title ?? ""}</strong> kini aktif dengan paket{" "}
            <strong>{plan?.name}</strong>. Selamat menyebar kabar bahagia!
          </p>
          <a href={`/dashboard/undangan/${payment.invitationId}`} className="mt-6 inline-block rounded-full bg-brand-600 px-7 py-3 text-sm font-semibold text-white shadow-md shadow-brand-200 transition hover:bg-brand-700">
            Kembali ke Editor
          </a>
        </div>
      </main>
    );
  }

  let instructions = "";
  try {
    const meta = JSON.parse(payment.meta || "{}");
    instructions = meta.instructions ?? "";
  } catch { /* abaikan */ }

  const mode = paymentMode();

  return (
    <OrderClient
      mode={mode}
      orderId={payment.orderId}
      planName={plan?.name ?? payment.plan}
      amount={payment.amount}
      method={payment.method}
      checkoutUrl={payment.checkoutUrl}
      instructions={instructions}
      createdAt={formatDateTimeID(payment.createdAt)}
      invitationTitle={payment.invitation?.title}
    />
  );
}

// Pastikan pengguna tanpa sesi dialihkan (double-guard)
export async function generateMetadata() {
  await getSessionUser().then((u) => { if (!u) redirect("/masuk"); });
  return { title: "Pesanan" };
}
