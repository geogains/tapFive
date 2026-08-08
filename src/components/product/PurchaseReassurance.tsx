import { ShieldCheck, CreditCard, PackageCheck } from "lucide-react";
import { purchaseReassurance } from "@/data/productDetailContent";

const icons = [ShieldCheck, CreditCard, PackageCheck];

export function PurchaseReassurance() {
  return (
    <ul className="flex flex-col gap-2.5 border-t border-tf-neutral-200 pt-5">
      {purchaseReassurance.map((item, index) => {
        const Icon = icons[index % icons.length];
        return (
          <li key={item.label} className="flex items-center gap-2.5 text-sm text-tf-neutral-600">
            <Icon className="h-4 w-4 shrink-0 text-tf-neutral-400" aria-hidden="true" />
            <span>{item.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
