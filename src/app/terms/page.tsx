import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { LegalContent } from "@/components/ui/LegalContent";
import { legalPages, company } from "@/data/site-content";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms and conditions for using the Tap Five website and ordering products.",
};

export default function TermsPage() {
  return (
    <div>
      <PageHero eyebrow="Legal" heading={legalPages.terms.heading} supporting={legalPages.terms.updated} />
      <LegalContent>
        <h2>1. About Tap Five</h2>
        <p>
          Tap Five (&ldquo;Tap Five&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo; or &ldquo;our&rdquo;) is a UK sole
          trader operating the website at <a href="https://tapfive.co.uk">tapfive.co.uk</a>, selling NFC-enabled
          physical cards — including Google Review Cards, Instagram Follow Cards and Custom Branded Cards —
          primarily to businesses in the United Kingdom.
        </p>

        <h2>2. How to contact us</h2>
        <p>
          You can reach us at <a href={`mailto:${company.email}`}>{company.email}</a> or via our{" "}
          <a href="/contact">Contact</a> page. As a sole trader, Tap Five does not currently publish a separate
          registered business address.
        </p>

        <h2>3. Scope of these Terms</h2>
        <p>
          These Terms apply whenever you use tapfive.co.uk or place an order with us. By using the website or
          placing an order, you accept these Terms. If you don&rsquo;t agree with them, please don&rsquo;t use the
          website or place an order.
        </p>

        <h2>4. Products</h2>
        <p>
          We currently sell Google Review Cards, Instagram Follow Cards and Custom Branded Cards. Product
          descriptions, images and pricing on the website are as accurate as we can reasonably make them, but
          minor variations (for example in card finish or exact colour reproduction) may occur.
        </p>

        <h2>5. NFC functionality</h2>
        <p>
          Each card contains an NFC (Near Field Communication) chip programmed to open the destination you
          specify when ordering. NFC tapping requires a compatible NFC-enabled device and, on some devices,
          NFC to be enabled — we can&rsquo;t guarantee compatibility with every phone, case or software version
          in existence.
        </p>

        <h2>6. QR functionality</h2>
        <p>
          Where a card includes a printed QR code, it is provided as a fallback way to reach the same destination
          on devices or in situations where NFC tapping isn&rsquo;t available, and depends on the customer&rsquo;s
          device having a working QR scanner (most modern phone cameras include one).
        </p>

        <h2>7. Your responsibility for the information you give us</h2>
        <p>
          We program each card using exactly the information you supply at checkout — your Google review
          destination, Instagram handle, custom destination URL, branding details or other configuration fields,
          as applicable to the product. It&rsquo;s your responsibility to check this information carefully before
          submitting your order, as described further in sections 8–10 and 25.
        </p>

        <h2>8. Google review destination information</h2>
        <p>
          For Google Review Cards, we use the business details or destination link you provide to configure the
          card to open your intended Google review page. We are not affiliated with, endorsed by, or partnered
          with Google — see section 29.
        </p>

        <h2>9. Instagram destination information</h2>
        <p>
          For Instagram Follow Cards, we use the Instagram handle you provide to configure the card to open that
          profile. We are not affiliated with, endorsed by, or partnered with Instagram or Meta — see section 29.
        </p>

        <h2>10. Custom artwork and branding</h2>
        <p>
          For Custom Branded Cards, we use the business name, destination, notes and any logo/artwork details you
          provide to design and produce your card. You&rsquo;re responsible for making sure you own or are
          licensed to use any logo, image or branding you supply to us — see section 27.
        </p>

        <h2>11. Orders</h2>
        <p>
          To order, you configure your chosen product with the required details and add it to your cart. Your
          cart shows the price for each item, including any TAP25 promotional pricing, before you proceed to
          checkout.
        </p>

        <h2>12. Order acceptance</h2>
        <p>
          Placing an order is an offer to buy, not automatic acceptance by us. A contract is formed once your
          payment has been confirmed as successful by our payment processor, Stripe, at which point we&rsquo;ll
          begin processing your order. We may decline or cancel an order — for example if a product has become
          unavailable, if the information supplied appears fraudulent or abusive, or if we&rsquo;re unable to
          verify payment — in which case we&rsquo;ll let you know and refund any amount already charged.
        </p>

        <h2>13. Pricing</h2>
        <p>
          All prices are shown in pounds sterling (GBP) and are the total price payable for the product shown,
          unless stated otherwise. We take reasonable care to ensure prices displayed are correct, but if a
          pricing error is discovered before your order is accepted, we&rsquo;ll contact you before proceeding.
        </p>

        <h2>14. TAP25 promotional pricing</h2>
        <p>
          Where shown, TAP25 is a promotional discount already built into the price you see in your cart and at
          checkout — you don&rsquo;t need to enter a code for it to apply. TAP25 (and any other promotion we run)
          is offered at our discretion, may have eligibility criteria, and may be changed, withdrawn or replaced
          at any time without affecting an order you&rsquo;ve already completed.
        </p>

        <h2>15. Additional Stripe promotion codes</h2>
        <p>
          You may be able to enter an additional promotion code at Stripe Checkout, on top of TAP25 pricing.
          These codes are configured directly in our payment platform and applied by Stripe as part of your
          payment; the final amount you&rsquo;re charged is whatever Stripe confirms after any such code is
          applied.
        </p>

        <h2>16. Promotion-code restrictions</h2>
        <ul>
          <li>Promotion codes may have expiry dates, minimum-spend conditions, or a limited number of redemptions.</li>
          <li>Codes are personal to the promotion they were issued for and have no cash value or cash alternative.</li>
          <li>Codes cannot usually be applied retrospectively to an order already completed.</li>
          <li>
            We may refuse or withdraw a promotion where we reasonably believe it&rsquo;s being misused (for
            example, shared publicly outside its intended audience or used to abuse repeat-order discounts),
            where permitted by law.
          </li>
        </ul>

        <h2>17. Payment</h2>
        <p>
          Payment is collected securely by Stripe at checkout. We do not receive or store your full card details.
          Your order is only processed once Stripe confirms your payment has succeeded.
        </p>

        <h2>18. Delivery</h2>
        <p>
          We currently deliver to addresses within the United Kingdom. Delivery timescales depend on production
          and dispatch — see our <a href="/shipping-returns">Shipping &amp; Returns</a> page for further
          information, or contact us if you need an estimate for a specific order.
        </p>

        <h2>19. Risk and title</h2>
        <p>
          Risk in your order (for example, loss or damage in transit) passes to you once the goods are delivered
          to the address you provided. Ownership of the goods passes to you once we&rsquo;ve received payment in
          full.
        </p>

        <h2>20. Cancellation rights</h2>
        <p>
          If you are a consumer (an individual buying wholly or mainly outside your trade, business, craft or
          profession) ordering from within the UK, you generally have a legal right to cancel your order within
          14 days without giving a reason, under the Consumer Contracts (Information, Cancellation and Additional
          Charges) Regulations 2013 — subject to the important exception described in section 21 below, which
          applies to Tap Five&rsquo;s personalised products.
        </p>
        <p>
          If you are ordering as a business (for example, purchasing in the course of your trade), the statutory
          consumer cancellation right described in this section does not automatically apply to your order, and
          your cancellation rights are as agreed between us or, in the absence of agreement, as provided by the
          general law applicable to commercial contracts.
        </p>

        <h2>21. Personalised and bespoke goods</h2>
        <p>
          Tap Five products are made to your specification: each card is programmed with the specific Google
          review destination, Instagram handle, custom URL or branding you supply, and Custom Branded Cards are
          additionally produced with your chosen artwork/branding. Once a card has been programmed, its NFC tag
          may be permanently locked to that destination so it can no longer be reprogrammed — at that point it is
          no longer generic stock that could simply be reset and resold.
        </p>
        <p>
          Where goods are made to a consumer&rsquo;s specifications or are clearly personalised, the law
          recognises that the standard 14-day change-of-mind cancellation right described in section 20 may not
          apply to them, because such goods generally can&rsquo;t be resold to another customer once produced.
          For Tap Five, this means:
        </p>
        <ul>
          <li>we may begin programming or producing your card as soon as your order is accepted;</li>
          <li>please check the destination, handle, branding and any other configuration details you submit carefully before completing your order, as described in section 7 and section 25;</li>
          <li>
            once a card has been permanently configured/locked, or once production of a Custom Branded Card has
            begun, we may not be able to change the destination or details you supplied, or to accept a
            change-of-mind cancellation for that item; and
          </li>
          <li>
            this does <strong>not</strong> affect your statutory rights in respect of goods that are faulty,
            damaged in transit, not as described, or otherwise fail to conform to the contract — see section 23.
          </li>
        </ul>
        <p>
          If you contact us promptly after placing an order and before production/programming has begun, we&rsquo;ll
          always try to accommodate a cancellation or correction where we reasonably can, even where we&rsquo;re
          not legally obliged to.
        </p>

        <h2>22. Locked/programmed NFC products</h2>
        <p>
          Where an NFC tag has been permanently locked to your chosen destination, that lock is a deliberate
          security and quality feature — it stops the card&rsquo;s destination being altered or hijacked after
          it&rsquo;s left our hands. It also means the physical card itself cannot later be repurposed for a
          different destination; if you need to change where a card points after it has been locked, you will
          generally need to order a new card.
        </p>

        <h2>23. Faulty, damaged or misdescribed products</h2>
        <p>
          Nothing in these Terms affects your statutory rights regarding goods that are faulty, damaged in
          transit, not as described, or otherwise do not conform to the contract — including, for consumers,
          rights under the Consumer Rights Act 2015. If you believe your card is faulty, damaged, or was
          configured incorrectly due to an error on our part, contact us as soon as reasonably possible with your
          order details and a description (and, where possible, a photo) of the issue, and we&rsquo;ll put it
          right — by repair, replacement, or refund as appropriate.
        </p>

        <h2>24. Returns and refunds</h2>
        <p>
          Where you have a valid right to cancel under section 20 (before the personalisation exception in
          section 21 applies), or where section 23 applies, contact us at{" "}
          <a href={`mailto:${company.email}`}>{company.email}</a> with your order details and we&rsquo;ll advise
          on next steps and process any refund due to the original payment method within a reasonable time.
        </p>

        <h2>25. Mistakes in supplied URLs, handles or business information</h2>
        <p>
          We program cards using exactly what you submit at checkout. If you supply an incorrect Google
          destination, Instagram handle, custom URL or other configuration detail, and this is only noticed after
          the card has been programmed/locked or production has begun, we may not be able to correct it without
          producing a new card at additional cost. Please double-check this information before completing your
          order.
        </p>

        <h2>26. Intellectual property</h2>
        <p>
          The Tap Five name, logo, website design and content (excluding customer-supplied material described in
          section 27) belong to us or our licensors. You may not copy, reproduce or reuse them without our
          permission, beyond what&rsquo;s reasonably necessary to use the website and your order.
        </p>

        <h2>27. Customer-supplied logos and artwork</h2>
        <p>
          By supplying a logo, image or other artwork for a Custom Branded Card, you confirm that you own it or
          are otherwise licensed to use and to have it reproduced on a physical card, and you agree we can use it
          solely to produce your order. You&rsquo;re responsible for ensuring the material doesn&rsquo;t infringe
          any third party&rsquo;s rights.
        </p>

        <h2>28. Acceptable use</h2>
        <p>
          Please don&rsquo;t use the website or our products to send anyone to unlawful, fraudulent, misleading or
          harmful content, to impersonate a business you&rsquo;re not authorised to represent, or to otherwise
          misuse our checkout, promotions, or website (for example, attempting to interfere with pricing or
          submit malicious data).
        </p>

        <h2>29. Third-party platforms</h2>
        <p>
          Tap Five is an independent business and is not affiliated with, sponsored by, endorsed by, or partnered
          with Google, Instagram, Meta, or any other third-party platform our products may direct customers to.
          Those platforms operate independently of us, may change their URLs, features, policies or availability
          at any time, and are outside our control — we&rsquo;ll always aim to keep our products working smoothly
          with them, but can&rsquo;t guarantee an outcome that depends on a third party&rsquo;s own systems.
        </p>

        <h2>30. No guaranteed results</h2>
        <p>
          Tap Five provides the NFC/QR mechanism that makes it quick and easy for someone to reach the destination
          you&rsquo;ve chosen. We don&rsquo;t and can&rsquo;t guarantee any particular outcome from using our
          products — including the number of Google reviews, review ratings, search or ranking improvements,
          Instagram followers, engagement, customer participation, sales, revenue or business growth. Results
          depend on factors entirely outside our control, such as how and where you use the card and how your
          customers respond.
        </p>

        <h2>31. Liability</h2>
        <p>
          Nothing in these Terms excludes or limits liability that cannot legally be excluded or limited,
          including liability for death or personal injury caused by negligence, or for fraud. Subject to that,
          our liability to you in connection with an order is limited to the amount you paid for that order, and
          we&rsquo;re not liable for indirect or consequential losses (such as loss of profit or business
          opportunity) that aren&rsquo;t a reasonably foreseeable result of our breach. If you are a consumer,
          nothing in these Terms limits any right or remedy you have that cannot lawfully be excluded.
        </p>

        <h2>32. Events outside our reasonable control</h2>
        <p>
          We won&rsquo;t be responsible for any delay or failure to perform our obligations caused by events
          outside our reasonable control, such as supplier or carrier delays, extreme weather, industrial action,
          or failures of third-party platforms or infrastructure (including our payment processor, database
          provider, or hosting provider) that we could not reasonably have avoided.
        </p>

        <h2>33. Changes to these Terms</h2>
        <p>
          We may update these Terms from time to time — the &ldquo;Last updated&rdquo; date at the top of this
          page shows when it was last revised. Changes won&rsquo;t apply retrospectively to an order you&rsquo;ve
          already placed and had accepted.
        </p>

        <h2>34. Governing law and jurisdiction</h2>
        <p>
          These Terms are governed by the laws of England and Wales. Any dispute arising out of or in connection
          with these Terms or an order is subject to the non-exclusive jurisdiction of the courts of England and
          Wales, without limiting any mandatory consumer protections you may be entitled to under the law of the
          country in which you are resident, where applicable.
        </p>

        <h2>35. Contact</h2>
        <p>
          Questions about these Terms, or about an order, can be sent to{" "}
          <a href={`mailto:${company.email}`}>{company.email}</a>, or via our <a href="/contact">Contact</a> page.
        </p>
      </LegalContent>
    </div>
  );
}
