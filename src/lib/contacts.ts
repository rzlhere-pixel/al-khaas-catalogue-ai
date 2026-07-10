export interface Contact {
  id: string;
  label: string;
  sublabel: string;
  phone: string; // international, no +
}

export const CONTACTS: Contact[] = [
  { id: "van1", label: "Van 1 · New Dubai", sublabel: "Barsha · Jumeirah · Silicon Oasis", phone: "971569939447" },
  { id: "van2", label: "Van 2 · Old Dubai", sublabel: "Karama · Deira · Abu Hail", phone: "971505124626" },
  { id: "alain", label: "Van 3 · Al Ain", sublabel: "Al Ain region", phone: "971504386784" },
  { id: "wholesale", label: "Wholesale", sublabel: "Trade orders", phone: "971565205567" },
  { id: "presales", label: "Pre-Sales", sublabel: "Quotes & info", phone: "971504385546" },
];

export function whatsappLink(phone: string, text: string) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function buildEnquiryMessage(
  items: { name: string; brand?: string; itemCode: string; weight?: string; qty: number }[],
) {
  const lines = items
    .map((i) => {
      const parts: string[] = [`• ${i.name}`];
      const meta: string[] = [];
      if (i.brand) meta.push(i.brand);
      if (i.weight) meta.push(i.weight);
      if (meta.length) parts[0] += ` — ${meta.join(" · ")}`;
      const tail: string[] = [];
      if (i.itemCode) tail.push(`SKU: ${i.itemCode}`);
      tail.push(`Qty: ${i.qty}`);
      parts.push(`   ${tail.join(" · ")}`);
      return parts.join("\n");
    })
    .join("\n");
  return `Hello Al Khaas,\n\nI'd like to enquire about the following products:\n\n${lines}\n\nPlease confirm availability and final pricing.\n\nThank you.`;
}

export function buildVisitMessage(v: {
  shopName: string;
  contactPerson: string;
  mobile: string;
  location: string;
  preferredDate: string;
  message?: string;
}) {
  return `Hello,\n\nI would like to request a shop visit.\n\n• Shop Name: ${v.shopName}\n• Contact Person: ${v.contactPerson}\n• Mobile: ${v.mobile}\n• Location: ${v.location}\n• Preferred Date: ${v.preferredDate}${v.message ? `\n• Notes: ${v.message}` : ""}\n\nThank you.`;
}
