/**
 * FAQ content for the Tap Five template.
 * Add, remove or edit entries — the FAQ accordion renders this list directly.
 */

export type Faq = {
  question: string;
  answer: string;
};

export const faqs: Faq[] = [
  {
    question: "What is an NFC Google Review card?",
    answer:
      "It's a small card fitted with an NFC chip. When a customer taps their smartphone against it, their browser opens directly on your Google review page, no searching, no typing.",
  },
  {
    question: "Do customers need to download an app?",
    answer:
      "No. NFC tapping works through the phone's built-in browser, so there's nothing for your customers to download or install.",
  },
  {
    question: "Does it work with iPhone and Android?",
    answer:
      "Yes. Tap Five cards work with modern NFC-enabled iPhone and Android devices without any additional setup on the customer's side.",
  },
  {
    question: "Can I change the review link later?",
    answer:
      "Yes. Your card can be reconfigured to point to a new link if your review page changes, so the physical card never needs replacing.",
  },
  {
    question: "Can the card use my branding?",
    answer:
      "Yes. Our Custom-Branded Card option can be produced using your logo and brand colours alongside your Google review link.",
  },
  {
    question: "How do I find my Google review link?",
    answer:
      "You can generate this from your Google Business Profile. If you're not sure how, our team can help you locate the correct link when you place an order.",
  },
  {
    question: "Do you configure the card for me?",
    answer:
      "Yes. Every Tap Five card is configured with your review link before it's dispatched, so it's ready to use as soon as it arrives.",
  },
  {
    question: "What happens after I place an order?",
    answer:
      "We'll confirm your review link with you, produce your card, and dispatch it to your business address. Full ordering will be available soon.",
  },
];
