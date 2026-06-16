/**
 * ডিএসই/সিএসই ব্রোকারেজ হাউজ রুলস অনুযায়ী হিসাব করার ইঞ্জিন
 */
export function calculateTrade(
  tradeType: "BUY" | "SELL",
  quantity: number,
  rate: number,
  commissionType: "PERCENTAGE" | "FIXED",
  commissionValue: number,
) {
  const amount = quantity * rate;
  let commissionAmount = 0;

  if (commissionType === "PERCENTAGE") {
    commissionAmount = amount * (commissionValue / 100);
  } else {
    commissionAmount = commissionValue;
  }

  // রাউন্ডিং ২ ডেসিমেল (টাকা-পয়সা সঠিক রাখার জন্য)
  const finalAmount = Math.round(amount * 100) / 100;
  const finalCommission = Math.round(commissionAmount * 100) / 100;

  // বাংলাদেশ লেজার রুল: BUY করলে ক্যাশ কমে (-), SELL করলে ক্যাশ বাড়ে (+)
  const netAmount =
    tradeType === "BUY"
      ? -(finalAmount + finalCommission)
      : finalAmount - finalCommission;

  return {
    amount: finalAmount,
    commissionAmount: finalCommission,
    netAmount: Math.round(netAmount * 100) / 100,
  };
}
