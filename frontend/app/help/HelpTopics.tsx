"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";

type HelpFaq = {
  question: string;
  paragraphs?: string[];
  bullets?: string[];
  steps?: string[];
  after?: string;
};

type HelpTopic = { id: string; title: string; faqs: HelpFaq[] };

const topics: HelpTopic[] = [
  {
    id: "getting-started",
    title: "1. Getting Started",
    faqs: [
      {
        question: "What is Universal Virtual Fitting Room?",
        paragraphs: [
          "Universal Virtual Fitting Room is a fashion discovery platform that connects customers with multiple fashion merchants in one place. It allows users to explore products from different merchants, compare available options, and experience AI-powered virtual try-on before visiting the merchant’s website to make a purchase.",
          "Our goal is to make online fashion discovery more interactive, convenient, and personalized.",
        ],
      },
      {
        question: "How does the platform work?",
        paragraphs: ["Customers can browse fashion products from multiple merchants, explore product details, compare different options, and use the Virtual Try-On feature to visualize selected garments. Once they find a product they like, they can visit the respective merchant’s website to complete their purchase."],
      },
      {
        question: "Do I need to create an account to use the platform?",
        paragraphs: ["You may explore available products without creating an account, depending on the features enabled for guest users. However, creating an account gives you access to personalized features such as managing your Digital Twin and viewing your virtual try-on history."],
      },
      {
        question: "How do I create an account?",
        paragraphs: ["To create an account:"],
        steps: ["Visit the registration page.", "Enter the required personal information.", "Provide a valid email address and create a password.", "Submit the registration form.", "Log in using your registered credentials."],
      },
      {
        question: "I forgot my password. What should I do?",
        paragraphs: ["Select the “Forgot Password” option on the login page, if available, and follow the instructions to reset your password. If you continue experiencing difficulties, contact our support team."],
      },
    ],
  },
  {
    id: "digital-twin",
    title: "2. Digital Twin",
    faqs: [
      {
        question: "What is a Digital Twin?",
        paragraphs: ["A Digital Twin is a personalized virtual representation of your body created using your uploaded photographs and body measurements. It allows the platform to provide a more personalized virtual try-on experience."],
      },
      {
        question: "How do I create my Digital Twin?",
        paragraphs: ["To create your Digital Twin:"],
        steps: ["Log in to your account.", "Navigate to the Digital Twin section.", "Upload the required photographs.", "Enter your body measurements.", "Review the information you have provided.", "Submit your details to create your Digital Twin."],
        after: "Once successfully created, your Digital Twin can be used for virtual try-on.",
      },
      {
        question: "What photographs should I upload?",
        paragraphs: ["Upload clear, well-lit photographs that show your body properly. Follow the image guidelines displayed on the Digital Twin creation page.", "For better results:"],
        bullets: ["Use clear, high-quality photographs.", "Make sure your body is visible.", "Avoid heavily edited or filtered images.", "Use a simple background where possible.", "Follow the recommended poses and image requirements."],
      },
      {
        question: "What body measurements are required?",
        paragraphs: ["The platform may request measurements such as:"],
        bullets: ["Height", "Weight", "Chest", "Waist", "Hip"],
        after: "Make sure you enter accurate measurements to support a better personalized experience.",
      },
      {
        question: "Can I update my Digital Twin?",
        paragraphs: ["Yes. You can update your Digital Twin by accessing the Digital Twin management section and replacing your photographs or updating your measurements, depending on the available functionality."],
      },
      {
        question: "Can I delete my Digital Twin?",
        paragraphs: ["Yes. If the deletion option is available, you can remove your Digital Twin through your account. Deleting your Digital Twin may affect access to features that depend on it, including future virtual try-on sessions."],
      },
      {
        question: "Is my Digital Twin information private?",
        paragraphs: ["We treat your Digital Twin photographs and body measurements as personal information and take reasonable measures to protect them. Your information is used to provide relevant platform features, including virtual try-on, and may be processed by third-party AI service providers when required to generate results.", "For more information, please refer to our Privacy Policy."],
      },
    ],
  },
  {
    id: "virtual-try-on",
    title: "3. Virtual Try-On",
    faqs: [
      {
        question: "What is Virtual Try-On?",
        paragraphs: ["Virtual Try-On is an AI-powered feature that allows you to visualize how a selected garment may look on your Digital Twin or an uploaded photograph. It provides a visual preview to help you explore different fashion styles before visiting a merchant’s website."],
      },
      {
        question: "How do I use Virtual Try-On?",
        paragraphs: ["To use the Virtual Try-On feature:"],
        steps: ["Log in to your account.", "Make sure you have created your Digital Twin, if required.", "Browse the available fashion products.", "Select the garment you want to try on.", "Choose the available size or other product options, if applicable.", "Open the Virtual Try-On feature.", "Select your Digital Twin or upload an image if guest try-on is supported.", "Click the Generate Try-On button.", "Wait for the AI-generated image to appear."],
        after: "You can then view the generated result and access it later through your try-on history, if available.",
      },
      {
        question: "Do I need a Digital Twin to use Virtual Try-On?",
        paragraphs: ["A Digital Twin is required for the personalized try-on experience available to registered users. Guest users may have access to a temporary image-upload option if that functionality is enabled."],
      },
      {
        question: "How long does it take to generate a try-on image?",
        paragraphs: ["Generation time may vary depending on image size, internet connectivity, server availability, and the AI processing service. Please wait for the generation process to complete before attempting another request."],
      },
      {
        question: "Why did my Virtual Try-On fail?",
        paragraphs: ["A virtual try-on request may fail because of:"],
        bullets: ["Poor internet connectivity.", "Unsupported or invalid image formats.", "Images that do not meet the required quality or size.", "Temporary AI service interruptions.", "Server or processing errors."],
        after: "Check your images and internet connection before trying again. If the problem continues, contact our support team.",
      },
      {
        question: "How accurate are the generated images?",
        paragraphs: ["AI-generated images provide a visual representation of how a garment may look on you. However, they may not perfectly represent the actual fit, size, colour, fabric, texture, or appearance of the garment.", "The generated result should be considered a visual reference rather than a guarantee of the actual wearing experience."],
      },
      {
        question: "Where can I find my previous try-on results?",
        paragraphs: ["Registered users can access their previous generated images through the Virtual Try-On History section, if available. You can review previous results and delete them using the available options."],
      },
      {
        question: "Can I delete my try-on results?",
        paragraphs: ["Yes. You can use the delete option available in your Virtual Try-On History to remove individual results, subject to the platform’s deletion functionality."],
      },
    ],
  },
  {
    id: "products-merchants",
    title: "4. Exploring Products and Merchants",
    faqs: [
      {
        question: "How can I browse fashion products?",
        paragraphs: ["Navigate to the Explore or Products section to view garments listed by different merchants. You can browse available categories and select individual products to view their details."],
      },
      {
        question: "Can I search for a specific product?",
        paragraphs: ["Yes. Use the search functionality to find products based on relevant keywords, product names, or categories, depending on the available search options."],
      },
      {
        question: "Can I filter products?",
        paragraphs: ["Yes. You can use the available filtering options to narrow down products based on categories, prices, sizes, colours, brands, or other supported product attributes."],
      },
      {
        question: "Can I compare products from different merchants?",
        paragraphs: ["Yes. The platform allows you to explore and compare products from multiple merchants. You can consider details such as price, brand, style, colour, and available sizes to make a more informed decision."],
      },
      {
        question: "How do I purchase a product?",
        paragraphs: ["Universal Virtual Fitting Room does not directly sell products or process payments.", "When you select a product you wish to purchase, you can use the provided merchant link or redirection option to visit the merchant’s website. You can then complete your purchase directly through that merchant."],
      },
      {
        question: "Why am I redirected to another website?",
        paragraphs: ["Our platform connects customers with independent fashion merchants rather than acting as a direct online store. Therefore, customers are redirected to the respective merchant’s website to complete purchases."],
      },
      {
        question: "Who handles payments, deliveries, and returns?",
        paragraphs: ["The respective merchant is responsible for handling product purchases, payment processing, delivery, refunds, exchanges, and other order-related matters. Please contact the merchant directly for assistance with these services."],
      },
      {
        question: "Are all products displayed on the platform available for purchase?",
        paragraphs: ["Product availability depends on the respective merchant. Product information, prices, sizes, and availability may change without notice. Please verify the latest details on the merchant’s website before making a purchase."],
      },
    ],
  },
  {
    id: "account-privacy",
    title: "5. Account and Privacy",
    faqs: [
      {
        question: "How can I update my account information?",
        paragraphs: ["Log in to your account and navigate to the Profile or Account Settings section. You can update the information available for editing through your account."],
      },
      {
        question: "How can I change my password?",
        paragraphs: ["If a password change option is available, navigate to Account Settings and follow the instructions to update your password."],
      },
      {
        question: "Can I delete my account?",
        paragraphs: ["You may request account deletion through the available account management options or by contacting our support team. Please note that deleting your account may result in the loss of access to your Digital Twin, saved information, and virtual try-on history."],
      },
      {
        question: "How is my personal information used?",
        paragraphs: ["We collect and use personal information to provide our services, manage user accounts, create Digital Twins, process virtual try-on requests, improve the platform, and maintain security.", "For further details, please read our Privacy Policy."],
      },
      {
        question: "Are my photographs shared with third-party services?",
        paragraphs: ["Photographs used for AI-powered virtual try-on may be transmitted to third-party AI service providers, such as Google’s Gemini API, for image processing and generation.", "We use these services to provide the virtual try-on functionality. Please refer to our Privacy Policy for further information about data processing and protection."],
      },
      {
        question: "Who can access my Digital Twin?",
        paragraphs: ["Your Digital Twin is intended to support your personalized experience. Access should be restricted to authorized processes and personnel where necessary to operate and maintain the service. We apply appropriate security measures to protect this information."],
      },
    ],
  },
  {
    id: "merchant-support",
    title: "6. Merchant Support",
    faqs: [
      {
        question: "How can I become a merchant on the platform?",
        paragraphs: ["If you are a fashion merchant interested in listing your products, you can register through the Merchant Registration section, if available. Follow the registration instructions and provide the required business information."],
      },
      {
        question: "How can I add products?",
        paragraphs: ["After accessing your merchant account:"],
        steps: ["Navigate to the Product Management section.", "Select the option to add a new product.", "Enter the product name and description.", "Select the appropriate category.", "Add product details such as price, available sizes, and colours.", "Upload clear product images.", "Provide the relevant product or merchant website link.", "Submit the product information."],
      },
      {
        question: "How can I update my product details?",
        paragraphs: ["Navigate to your product management dashboard, select the product you want to update, and edit the relevant information. Save your changes to update the listing."],
      },
      {
        question: "How can I remove a product?",
        paragraphs: ["Access your product management dashboard, select the relevant product, and use the available delete or remove option."],
      },
      {
        question: "Why is my product not appearing on the platform?",
        paragraphs: ["Your product may not appear because:"],
        bullets: ["The product information is incomplete.", "The product image has not uploaded successfully.", "The product listing is inactive or pending approval, if approval is required.", "The product does not meet the platform’s listing requirements.", "A temporary technical issue has occurred."],
        after: "Review your product information and contact the administrator if the problem continues.",
      },
      {
        question: "Can I manage my own product prices and availability?",
        paragraphs: ["Merchants are responsible for maintaining accurate product information, including prices, available sizes, colours, and product links, through the available merchant management features."],
      },
      {
        question: "Who handles customer purchases?",
        paragraphs: ["Merchants handle purchases directly through their own websites or sales channels. Universal Virtual Fitting Room provides a platform for product discovery and merchant connections but does not process customer orders or payments."],
      },
    ],
  },
  {
    id: "troubleshooting",
    title: "7. Troubleshooting",
    faqs: [
      {
        question: "I cannot log in to my account.",
        paragraphs: ["Check that you have entered the correct email address and password. If you have forgotten your password, use the password reset option if available. If the problem continues, contact support."],
      },
      {
        question: "My photograph is not uploading.",
        paragraphs: ["Check the following:"],
        bullets: ["Make sure the image is in a supported format.", "Ensure the file size is within the permitted limit.", "Check your internet connection.", "Try uploading a different image.", "Refresh the page and try again."],
      },
      {
        question: "My Digital Twin is not loading.",
        paragraphs: ["Try refreshing the page and checking your internet connection. If the problem continues, log out and log in again. Contact support if your Digital Twin remains unavailable."],
      },
      {
        question: "My Virtual Try-On image is not generating.",
        paragraphs: ["Ensure that your Digital Twin or uploaded photograph is available and that the selected garment has a valid image. Check your internet connection and try again after a short period."],
      },
      {
        question: "The generated image does not look accurate.",
        paragraphs: ["AI-generated results may vary depending on image quality, lighting, pose, and garment details. Try using a clearer photograph and ensure that your uploaded image follows the recommended guidelines."],
      },
      {
        question: "A product link is not working.",
        paragraphs: ["Product links are managed by the respective merchants. If a link is unavailable or redirects to an incorrect page, contact the merchant or report the issue to our support team."],
      },
      {
        question: "The website is not responding properly.",
        paragraphs: ["Check your internet connection, refresh the page, and try accessing the Platform using an updated browser. If the issue continues, contact support with a description of the problem."],
      },
    ],
  },
];

function PrivacyLinkedText({ text }: { text: string }) {
  const parts = text.split("Privacy Policy");
  return parts.map((part, index) => (
    <Fragment key={index}>
      {part}
      {index < parts.length - 1 && <Link href="/privacy" className="font-medium text-fuchsia-700 underline">Privacy Policy</Link>}
    </Fragment>
  ));
}

export default function HelpTopics() {
  const [query, setQuery] = useState("");
  const filteredTopics = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return topics;
    return topics
      .map((topic) => ({
        ...topic,
        faqs: topic.faqs.filter((faq) =>
          [faq.question, ...(faq.paragraphs ?? []), ...(faq.bullets ?? []), ...(faq.steps ?? []), faq.after ?? ""]
            .join(" ")
            .toLocaleLowerCase()
            .includes(normalizedQuery),
        ),
      }))
      .filter((topic) => topic.faqs.length > 0);
  }, [query]);

  return (
    <>
      <section className="rounded-3xl bg-gradient-to-br from-purple-700 via-fuchsia-600 to-blue-600 px-6 py-12 text-white shadow-lg sm:px-12 sm:py-14">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">Help Center</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">How Can We Help You?</h1>
        <p className="mt-5 max-w-4xl leading-7 text-white/90">Welcome to the Universal Virtual Fitting Room Help Center! We’re here to help you make the most of your fashion discovery and virtual try-on experience.</p>
        <p className="mt-4 max-w-4xl leading-7 text-white/90">Whether you’re a customer exploring fashion products, creating your Digital Twin, trying on garments virtually, or a merchant managing product listings, you’ll find helpful information and answers to common questions here.</p>
        <p className="mt-4 max-w-4xl leading-7 text-white/90">Browse our help topics or search for a specific question to find the assistance you need.</p>
        <label className="mt-7 block max-w-2xl">
          <span className="sr-only">Search help topics</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search help topics and questions"
            className="w-full rounded-xl border border-white/30 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-500 outline-none focus:ring-4 focus:ring-white/30"
          />
        </label>
      </section>

      <nav aria-label="Help topics" className="mt-6 flex flex-wrap gap-2">
        {filteredTopics.map((topic) => (
          <a key={topic.id} href={`#${topic.id}`} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 hover:text-fuchsia-700">
            {topic.title}
          </a>
        ))}
      </nav>

      <div className="mt-8 space-y-8">
        {filteredTopics.map((topic) => (
          <section id={topic.id} key={topic.id} className="scroll-mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-9">
            <h2 className="text-2xl font-bold text-gray-900">{topic.title}</h2>
            <div className="mt-5 space-y-4">
              {topic.faqs.map((faq) => (
                <details key={faq.question} className="group rounded-2xl border border-gray-200 px-5 py-4 open:bg-gray-50">
                  <summary className="cursor-pointer list-none pr-8 font-semibold text-gray-900 marker:hidden">
                    <span className="flex items-center justify-between gap-4">
                      {faq.question}
                      <span aria-hidden="true" className="text-xl text-fuchsia-600 transition-transform group-open:rotate-45">+</span>
                    </span>
                  </summary>
                  <div className="mt-4 space-y-3 leading-7 text-gray-700">
                    {faq.paragraphs?.map((paragraph, index) => <p key={index}><PrivacyLinkedText text={paragraph} /></p>)}
                    {faq.bullets && <ul className="list-disc space-y-1 pl-6">{faq.bullets.map((item) => <li key={item}>{item}</li>)}</ul>}
                    {faq.steps && <ol className="list-decimal space-y-1 pl-6">{faq.steps.map((step) => <li key={step}>{step}</li>)}</ol>}
                    {faq.after && <p>{faq.after}</p>}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
        {filteredTopics.length === 0 && (
          <p className="rounded-2xl bg-white p-6 text-gray-700 shadow-sm ring-1 ring-gray-200" role="status">
            No help topics match “{query}”. Try a different search term or contact our support team.
          </p>
        )}
      </div>

      <section id="contact-support" className="mt-8 scroll-mt-6 rounded-3xl bg-gray-900 px-6 py-9 text-white sm:px-10">
        <h2 className="text-2xl font-bold">8. Contact Support</h2>
        <h3 className="mt-5 text-xl font-semibold">Still Need Help?</h3>
        <p className="mt-3 leading-7 text-gray-300">Couldn’t find the answer you were looking for? Our support team is here to help.</p>
        <p className="mt-3 leading-7 text-gray-300">If you experience technical difficulties, have questions about your account, or need assistance with Digital Twin, Virtual Try-On, or merchant-related features, please contact us.</p>
        <h3 className="mt-7 text-lg font-semibold">Submit a Support Request</h3>
        <p className="mt-2 leading-7 text-gray-300">Please provide the following information so we can better understand your issue:</p>
        <ul className="mt-3 list-disc space-y-1 pl-6 text-gray-300">
          <li>Full Name</li><li>Email Address</li><li>User Type (Customer / Merchant)</li><li>Issue Category</li><li>Subject</li><li>Description of the Issue</li><li>Attachment (Optional)</li>
        </ul>
        <p className="mt-4 leading-7 text-gray-300">Our team will review your request and respond through the contact details you provide.</p>
        <h3 className="mt-7 text-lg font-semibold">Support Categories</h3>
        <ul className="mt-3 grid list-disc gap-x-8 gap-y-1 pl-6 text-gray-300 sm:grid-cols-2">
          <li>Account and Login Issues</li><li>Digital Twin Assistance</li><li>Virtual Try-On Problems</li><li>Product and Merchant Issues</li><li>Technical Difficulties</li><li>Privacy and Security</li><li>Other Inquiries</li>
        </ul>
        <p className="mt-7 font-semibold">Thank you for using Universal Virtual Fitting Room!</p>
        <p className="mt-2 leading-7 text-gray-300">We are committed to making your fashion discovery experience easier, more interactive, and more enjoyable.</p>
      </section>
    </>
  );
}
