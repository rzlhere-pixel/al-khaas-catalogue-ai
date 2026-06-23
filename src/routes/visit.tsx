import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { ContactPicker } from "@/components/contact-picker";
import { buildVisitMessage } from "@/lib/contacts";
import { Store } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/visit")({
  head: () => ({
    meta: [
      { title: "Request a shop visit — Al Khaas" },
      { name: "description", content: "Request a visit from an Al Khaas sales representative to your shop." },
    ],
  }),
  component: VisitPage,
});

function VisitPage() {
  const [shopName, setShopName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [mobile, setMobile] = useState("");
  const [location, setLocation] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [message, setMessage] = useState("");
  const [picker, setPicker] = useState(false);

  const valid = shopName && contactPerson && mobile && location && preferredDate;
  const text = useMemo(
    () => buildVisitMessage({ shopName, contactPerson, mobile, location, preferredDate, message }),
    [shopName, contactPerson, mobile, location, preferredDate, message],
  );

  return (
    <AppShell>
      <section className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-cocoa text-cream">
            <Store className="h-5 w-5" />
          </span>
          <div>
            <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Trade service</div>
            <h1 className="font-display text-4xl text-foreground sm:text-5xl">Request a shop visit</h1>
          </div>
        </div>
        <div className="gold-divider mt-4 w-16" />
        <p className="mt-4 max-w-xl text-sm text-muted-foreground">
          Tell us about your shop and a preferred date — our sales representative will reach out on
          WhatsApp to confirm the visit.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) setPicker(true);
          }}
          className="mt-10 grid gap-4 rounded-3xl border border-border bg-card p-6 shadow-soft sm:grid-cols-2 sm:p-8"
        >
          <Field label="Shop name *" value={shopName} onChange={setShopName} placeholder="Sunrise Supermarket" />
          <Field label="Contact person *" value={contactPerson} onChange={setContactPerson} placeholder="Mr. Ahmed" />
          <Field label="Mobile number *" value={mobile} onChange={setMobile} placeholder="+971 50 123 4567" type="tel" />
          <Field label="Location *" value={location} onChange={setLocation} placeholder="Al Quoz, Dubai" />
          <Field label="Preferred visit date *" value={preferredDate} onChange={setPreferredDate} type="date" />
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">Message (optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Anything specific you'd like to discuss?"
              className="mt-1.5 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm shadow-soft outline-none placeholder:text-muted-foreground focus:border-gold focus:ring-2 focus:ring-gold/30"
            />
          </div>
          <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              Your details are only shared in the WhatsApp message you send.
            </div>
            <button
              type="submit"
              disabled={!valid}
              className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-6 py-3 text-sm font-semibold text-whatsapp-foreground shadow-soft hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue to WhatsApp
            </button>
          </div>
        </form>
      </section>

      <ContactPicker open={picker} onClose={() => setPicker(false)} message={text} title="Send visit request to" />
    </AppShell>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm shadow-soft outline-none placeholder:text-muted-foreground focus:border-gold focus:ring-2 focus:ring-gold/30"
      />
    </div>
  );
}
