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
      "Yes. Our Custom Branded Card option can be produced using your logo and brand colours alongside your Google review link.",
  },
  {
    question: "How do I connect my business to the card?",
    answer:
      "Use our Business Finder when ordering to search for and select your Google Business Profile. We’ll use it to configure your card so customers can go straight to your Google review page with a tap or scan.",
  },
  {
    question: "Do you configure the card for me?",
    answer:
      "Yes. Every Tap Five card is configured with your review link before it's dispatched, so it's ready to use as soon as it arrives.",
  },
  {
    question: "What happens after I place an order?",
    answer:
      "Once your order is placed, we’ll configure your card using the business you selected, produce it, and dispatch it to your delivery address. Your card will arrive ready to use.",
  },
];
