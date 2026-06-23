import { CONTACTS, whatsappLink } from "@/lib/contacts";
import { Phone, X } from "lucide-react";
import { useEffect } from "react";

export function ContactPicker({
  open,
  onClose,
  message,
  title = "Who would you like to contact?",
}: {
  open: boolean;
  onClose: () => void;
  message: string;
  title?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-cocoa/60 p-0 sm:items-center sm:p-6 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-t-3xl bg-card shadow-lift sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <div className="font-display text-lg text-foreground">{title}</div>
            <div className="text-xs text-muted-foreground">Opens WhatsApp with your enquiry</div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-muted-foreground hover:bg-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>
        <ul className="divide-y divide-border">
          {CONTACTS.map((c) => (
            <li key={c.id}>
              <a
                href={whatsappLink(c.phone, message)}
                target="_blank"
                rel="noreferrer"
                onClick={onClose}
                className="flex items-center justify-between px-5 py-4 transition hover:bg-secondary"
              >
                <div>
                  <div className="text-sm font-medium text-foreground">{c.label}</div>
                  <div className="text-xs text-muted-foreground">{c.sublabel} · +{c.phone}</div>
                </div>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-soft">
                  <Phone className="h-4 w-4" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
