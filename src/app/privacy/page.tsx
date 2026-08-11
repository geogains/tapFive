import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { LegalContent } from "@/components/ui/LegalContent";
import { legalPages, company } from "@/data/site-content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Tap Five collects, uses and protects your information.",
};

export default function PrivacyPage() {
  return (
    <div>
      <PageHero eyebrow="Legal" heading={legalPages.privacy.heading} supporting={legalPages.privacy.updated} />
      <LegalContent>
        <h2>1. Who we are</h2>
        <p>
          Tap Five (&ldquo;Tap Five&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo; or &ldquo;our&rdquo;) is a UK sole
          trader operating the website at{" "}
          <a href="https://tapfive.co.uk">tapfive.co.uk</a> and selling NFC-enabled physical cards — including
          Google Review Cards, Instagram Follow Cards and Custom Branded Cards — primarily to businesses in the
          United Kingdom. This policy explains what personal information we collect through the website, why we
          collect it, and the choices and rights you have over it.
        </p>

        <h2>2. Contact details</h2>
        <p>
          For any question about this policy or about your personal information, contact us at{" "}
          <a href={`mailto:${company.email}`}>{company.email}</a>. As a sole trader, Tap Five does not currently
          publish a separate registered business address; if you would like details of how to contact us in
          writing, please ask using the email address above.
        </p>

        <h2>3. Personal information we collect</h2>
        <p>We only collect personal information that you choose to give us, in these places:</p>
        <ul>
          <li>information you provide when placing an order (see section 4);</li>
          <li>product customisation/configuration details you supply for the card you order (section 5);</li>
          <li>information you submit through our contact form (section 6);</li>
          <li>payment and billing/shipping details you provide to our payment processor, Stripe, at checkout (section 7); and</li>
          <li>limited technical information generated automatically by your browser and our hosting provider when you use the website (section 9).</li>
        </ul>
        <p>We do not buy personal information from third parties, and we do not currently use analytics or advertising cookies (see section 10).</p>

        <h2>4. Information provided when placing an order</h2>
        <p>
          When you check out, our server records the products and quantities you ordered, the price charged (after
          any TAP25 or additional Stripe promotion-code discount), and — once Stripe confirms payment — the email
          address and name Stripe provides to us, together with Stripe&rsquo;s own reference for your Checkout
          Session and payment. This is stored in our order database (see section 14) so we can fulfil, account for
          and, if needed, resolve queries about your order.
        </p>

        <h2>5. Product customisation/configuration information</h2>
        <p>
          Because each card is programmed to a specific destination before dispatch, the product page for your
          card asks for the information needed to configure it, for example:
        </p>
        <ul>
          <li>for a Google Review Card: your business details and/or Google review destination;</li>
          <li>for an Instagram Follow Card: the Instagram account/handle to link to; and</li>
          <li>for a Custom Branded Card: your business name, the destination the card should open, any notes you provide, and (where supplied) details of a logo/artwork file.</li>
        </ul>
        <p>
          This information is stored against your order so we can program your card correctly and refer back to it
          if you contact us about the order.
        </p>

        <h2>6. Contact-form submissions</h2>
        <p>
          Our contact form asks for your name, email address, and your message, with optional fields for a
          business name, phone number and subject. Submitting the form sends this information to us so we can
          respond to your enquiry; it is stored in our database (see section 14) for as long as reasonably
          necessary to handle the enquiry and keep a record of the correspondence.
        </p>

        <h2>7. Payment information</h2>
        <p>
          Tap Five does not collect or store your full card number, CVC/security code, or other complete card
          details — these are entered directly into a payment page hosted by our payment processor,{" "}
          <a href="https://stripe.com/gb/privacy" target="_blank" rel="noopener noreferrer">
            Stripe
          </a>
          , and handled entirely by Stripe. Stripe shares with us only what we need to fulfil and reconcile your
          order — for example your email address, name, the delivery address you enter at checkout, the amount
          paid, and Stripe&rsquo;s own transaction reference. Stripe acts as an independent controller of the
          payment information you give it directly; its own privacy policy explains how it handles that
          information.
        </p>

        <h2>8. Shipping/delivery information</h2>
        <p>
          At checkout, Stripe collects the delivery address needed to post your card (currently limited to UK
          addresses). That address is held within Stripe&rsquo;s own checkout records for fulfilment purposes; it
          is not separately copied into our order database beyond what is described in section 4.
        </p>

        <h2>9. Technical information collected when using the website</h2>
        <p>
          Like any website, ordinary use of tapfive.co.uk causes technical information — such as your IP address,
          browser type and the pages requested — to pass through our hosting infrastructure&rsquo;s standard
          server logs, purely as a normal part of serving web pages securely and reliably. We do not currently run
          any analytics, advertising or audience-measurement service that profiles visitors or builds a picture of
          your browsing activity.
        </p>

        <h2>10. Cookies, local storage and similar technologies</h2>
        <p>
          Tap Five does not currently set any cookies of its own. The website uses your browser&rsquo;s local
          storage (not a cookie) for two strictly necessary purposes only:
        </p>
        <ul>
          <li>
            <strong>Shopping cart</strong> — remembering the products, quantities and configuration you&rsquo;ve
            added to your cart, so it survives a page refresh and is there when you return to check out. Without
            this, the cart could not function.
          </li>
          <li>
            <strong>Promotional banner preference</strong> — a small flag remembering that you&rsquo;ve already
            seen our first-visit TAP25 promotional banner, so it doesn&rsquo;t show again on later visits to the
            same browser.
          </li>
        </ul>
        <p>
          Neither of these technologies is used for analytics, advertising or tracking you across other websites,
          and neither shares information with any third party. Under the UK Privacy and Electronic Communications
          Regulations (PECR), storage that is strictly necessary to provide a service you&rsquo;ve actively
          requested — such as a shopping cart — does not require your prior consent, which is why we haven&rsquo;t
          shown you a cookie-consent banner. If that ever changes — for example if we introduce analytics or
          advertising technologies in future — we will update this section and put an appropriate consent
          mechanism in place before those technologies are used. Once you reach Stripe&rsquo;s own checkout page
          to pay, Stripe may set cookies of its own under its domain, governed by Stripe&rsquo;s own cookie and
          privacy practices, not this policy.
        </p>

        <h2>11. Why we use personal information</h2>
        <ul>
          <li>to process, produce, program and dispatch the cards you order;</li>
          <li>to communicate with you about your order, including confirmations and any issues that need resolving;</li>
          <li>to respond to enquiries submitted through our contact form;</li>
          <li>to maintain accurate accounting, tax and business records;</li>
          <li>to detect, investigate and prevent fraud or misuse of our checkout; and</li>
          <li>to keep the website running securely and diagnose technical problems.</li>
        </ul>

        <h2>12. Our lawful bases for processing (UK GDPR)</h2>
        <ul>
          <li>
            <strong>Performance of a contract</strong> (Article 6(1)(b)) — for order information, product
            configuration details, and communicating with you to fulfil an order you&rsquo;ve placed.
          </li>
          <li>
            <strong>Legal obligation</strong> (Article 6(1)(c)) — for retaining certain order and payment records
            to meet our accounting and tax obligations.
          </li>
          <li>
            <strong>Legitimate interests</strong> (Article 6(1)(f)) — for responding to contact-form enquiries,
            keeping the website secure, and preventing fraud, each weighed against your interests and rights. You
            can ask us more about, or object to, any processing carried out on this basis — see section 20.
          </li>
        </ul>

        <h2>13. How Stripe handles your payment</h2>
        <p>
          All card payments are processed by Stripe, a PCI-DSS-compliant payment provider. You enter your payment
          details directly with Stripe, either on a Stripe-hosted checkout page or through Stripe&rsquo;s secure
          payment fields — Tap Five&rsquo;s own servers never receive or store your full card number or CVC. TAP25
          and any additional Stripe promotion code you enter are applied by Stripe as part of that checkout; Tap
          Five&rsquo;s server independently confirms the final amount Stripe reports as paid before treating an
          order as complete.
        </p>

        <h2>14. How order and contact information is stored (Supabase)</h2>
        <p>
          Order records, product configuration details and contact-form submissions are stored in a database
          hosted by Supabase. Access to that database is restricted to Tap Five&rsquo;s own server-side code using
          a privileged key that is never exposed to your browser — Row Level Security is enabled on every relevant
          table, and no rule permits the website itself (or any member of the public) to read, list, or modify
          that data directly. In short: the database is not publicly accessible, and the only path into it is
          server-side code acting on Tap Five&rsquo;s behalf.
        </p>

        <h2>15. Other service providers</h2>
        <p>Based on how the website is actually built and hosted, the following providers may process personal information on Tap Five&rsquo;s behalf or as an independent party to your payment:</p>
        <ul>
          <li><strong>Stripe, Inc.</strong> — payment processing (section 7 and 13);</li>
          <li><strong>Supabase</strong> — database hosting for order and contact-form records (section 14); and</li>
          <li><strong>our website hosting provider</strong> — serving the website and processing the technical/server-log information described in section 9.</li>
        </ul>
        <p>We do not currently use any analytics, advertising, marketing or customer-relationship-management platform.</p>

        <h2>16. Data sharing</h2>
        <p>
          We do not sell personal information. We share it only with the service providers listed in section 15,
          to the extent needed for them to provide their service to us, and where we&rsquo;re required to by law
          (for example, to a tax authority or law enforcement body with a valid legal basis to request it).
        </p>

        <h2>17. International transfers</h2>
        <p>
          Stripe and Supabase may process information on infrastructure located outside the UK. Where personal
          information is transferred outside the UK, those providers are responsible for ensuring an appropriate
          safeguard is in place (such as the UK&rsquo;s International Data Transfer Addendum or equivalent
          standard contractual clauses, or an applicable adequacy decision) as part of their own compliance
          obligations as service providers to UK businesses.
        </p>

        <h2>18. How long we keep information</h2>
        <p>
          We keep personal information only for as long as reasonably necessary for the purpose it was collected,
          taking into account fulfilment, accounting, legal, dispute-resolution and fraud-prevention needs:
        </p>
        <ul>
          <li>
            <strong>Order and payment records</strong> are generally kept for as long as we have an ongoing
            accounting or statutory record-keeping obligation, and for a reasonable period afterwards in case a
            dispute, warranty or fraud query arises.
          </li>
          <li>
            <strong>Contact-form enquiries</strong> that don&rsquo;t lead to an order are generally kept for a
            shorter period, only for as long as reasonably useful to handle the enquiry and any immediate
            follow-up, and may be deleted sooner than order records.
          </li>
        </ul>
        <p>
          We don&rsquo;t commit to a single fixed number of days or years here, because the appropriate period
          genuinely differs between, say, a paid order with accounting implications and a general question that&rsquo;s
          been fully answered — but in every case the guiding principle is to keep information no longer than is
          reasonably necessary.
        </p>

        <h2>19. Data security</h2>
        <p>
          Payment details are collected and secured by Stripe, not by us. Order and contact-form data is held in a
          database protected by Row Level Security and reachable only through privileged server-side code — never
          directly from the browser (see section 14). We keep the credentials that grant that server-side access
          confidential and out of any code that reaches your browser.
        </p>

        <h2>20. Your rights</h2>
        <p>Under UK GDPR, you have the right to:</p>
        <ul>
          <li>ask us for a copy of the personal information we hold about you;</li>
          <li>ask us to correct information that&rsquo;s inaccurate or incomplete;</li>
          <li>ask us to delete your personal information, where there&rsquo;s no overriding reason for us to keep it;</li>
          <li>ask us to restrict how we use your information, in certain circumstances;</li>
          <li>object to processing we carry out on the basis of legitimate interests; and</li>
          <li>ask for a portable copy of information you&rsquo;ve provided to us, where technically feasible.</li>
        </ul>
        <p>
          To exercise any of these rights, email <a href={`mailto:${company.email}`}>{company.email}</a>. We may
          need to verify your identity before acting on a request, and some rights don&rsquo;t apply
          unconditionally — for example, we may need to keep order records that we&rsquo;re legally required to
          retain for accounting purposes even if you ask us to delete them.
        </p>

        <h2>21. Right to complain to the ICO</h2>
        <p>
          If you have concerns about how we handle your personal information, we&rsquo;d welcome the chance to put
          it right directly — please contact us first. You also have the right to complain to the UK&rsquo;s
          independent supervisory authority for data protection, the Information Commissioner&rsquo;s Office
          (ICO), at{" "}
          <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">
            ico.org.uk
          </a>
          .
        </p>

        <h2>22. Children&rsquo;s privacy</h2>
        <p>
          Tap Five&rsquo;s products and website are intended for business customers and other adults, not
          children. We do not knowingly collect personal information from children.
        </p>

        <h2>23. Changes to this policy</h2>
        <p>
          We may update this policy from time to time, for example if the way the website works changes. The
          &ldquo;Last updated&rdquo; date at the top of this page shows when it was last revised. We encourage you
          to check back periodically.
        </p>

        <h2>24. Contact us</h2>
        <p>
          Questions about this policy, or about your personal information, can be sent to{" "}
          <a href={`mailto:${company.email}`}>{company.email}</a>, or via our{" "}
          <a href="/contact">Contact</a> page.
        </p>
      </LegalContent>
    </div>
  );
}
