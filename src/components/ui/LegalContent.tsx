import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

export function LegalContent({ children }: { children: ReactNode }) {
  return (
    <section className="bg-tf-white tf-section">
      <Container>
        <div className="legal-content max-w-3xl">{children}</div>
      </Container>
    </section>
  );
}
