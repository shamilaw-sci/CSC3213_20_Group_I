import type { Metadata } from "next";
import { Fragment } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import GoBackButton from "@/app/components/GoBackButton";

export const metadata: Metadata = {
  title: "Terms & Conditions | Universal Virtual Fitting Room",
  description: "Terms and Conditions for the Universal Virtual Fitting Room platform.",
};

type TermsSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
  after?: string[];
  subsections?: { title: string; text: string }[];
  secondBullets?: string[];
  ending?: string[];
};

const sections: TermsSection[] = [
  {
    title: "SECTION 1 – ACCEPTANCE OF TERMS",
    paragraphs: ["By accessing or using the Platform, you confirm that:"],
    bullets: [
      "You have read and understood these Terms and Conditions.",
      "You agree to comply with the rules and policies described here.",
      "You will use the Platform only for lawful purposes.",
      "You will provide accurate information when creating an account or using our services.",
    ],
    after: [
      "We reserve the right to update or modify these Terms and Conditions when necessary. Continued use of the Platform after changes are published constitutes acceptance of the revised terms.",
    ],
  },
  {
    title: "SECTION 2 – ELIGIBILITY AND USER ACCOUNTS",
    paragraphs: ["Users may access certain features of the Platform as guests or registered users."],
    bullets: [
      "Users must provide accurate and complete information when registering.",
      "Users are responsible for maintaining the confidentiality of their login credentials.",
      "Users must not share accounts or impersonate other individuals.",
      "Users are responsible for activities performed through their accounts.",
      "We reserve the right to suspend or terminate accounts involved in fraudulent, abusive, or unauthorized activities.",
    ],
    after: [
      "Certain features, including Digital Twin management and access to personalized try-on history, may require registration and authentication.",
    ],
  },
  {
    title: "SECTION 3 – DESCRIPTION OF SERVICES",
    paragraphs: ["Our Platform provides the following services:"],
    subsections: [
      { title: "3.1 Multi-Merchant Fashion Discovery", text: "The Platform allows users to explore clothing and fashion products listed by multiple registered merchants in one place." },
      { title: "3.2 Product Comparison", text: "Users can compare products from different merchants based on available information, including price, brand, category, colour, size, and style." },
      { title: "3.3 Digital Twin", text: "Registered users may create and manage a Digital Twin profile using uploaded photographs and personal body measurements." },
      { title: "3.4 AI-Powered Virtual Try-On", text: "The Platform uses artificial intelligence technology to generate visual representations of users wearing selected garments." },
      { title: "3.5 Merchant Redirection", text: "Users may be redirected to the relevant merchant’s website or product page to obtain further product information or complete a purchase." },
    ],
    after: [
      "The Platform acts as a fashion discovery and virtual fitting service. It does not directly sell, manufacture, stock, deliver, or process payments for products listed by merchants.",
    ],
  },
  {
    title: "SECTION 4 – DIGITAL TWIN AND USER-UPLOADED IMAGES",
    paragraphs: ["Users may upload photographs and body measurements to create and manage their Digital Twin profiles.", "By uploading such information, users agree that:"],
    bullets: [
      "They have the right and permission to upload the submitted photographs.",
      "The submitted information is accurate to the best of their knowledge.",
      "The uploaded images will only be used for the intended Platform functionalities.",
      "They will not upload images containing unlawful, harmful, or unauthorized content.",
    ],
    after: [
      "Users are responsible for maintaining the accuracy of their Digital Twin information.",
      "Users may update or delete their Digital Twin information through the available Platform features, subject to applicable technical and legal requirements.",
      "We implement reasonable measures to protect uploaded photographs, measurements, and related personal information.",
    ],
  },
  {
    title: "SECTION 5 – AI-POWERED VIRTUAL TRY-ON DISCLAIMER",
    paragraphs: ["Our Virtual Try-On feature uses third-party artificial intelligence technology to generate visual previews of selected garments on user-provided images.", "Users acknowledge that:"],
    bullets: [
      "Generated images are AI-produced visual representations and may not accurately reflect the actual appearance or fit of a garment.",
      "The generated results may contain visual inaccuracies or alterations.",
      "Actual garment colour, texture, material, size, and fit may differ from the generated preview.",
      "The generated image should not be considered a guarantee of product suitability or physical fitting accuracy.",
      "AI-generated results are intended for informational and visualization purposes only.",
    ],
    after: [
      "We do not guarantee that every generated image will perfectly preserve the user’s appearance or the original garment’s details.",
      "Users should refer to the relevant merchant’s product information and sizing guidance before making purchasing decisions.",
    ],
  },
  {
    title: "SECTION 6 – MERCHANTS AND PRODUCT INFORMATION",
    paragraphs: ["The Platform allows multiple merchants to register and display their products."],
    bullets: [
      "Merchants are responsible for the accuracy and completeness of their product information.",
      "Merchants are responsible for providing accurate prices, descriptions, images, sizes, and availability information.",
      "Product information may change without prior notice.",
      "We do not guarantee the availability, quality, authenticity, or suitability of products listed by merchants.",
      "We reserve the right to remove inaccurate, misleading, inappropriate, or unauthorized product listings.",
    ],
    after: ["The Platform does not independently verify every product detail provided by merchants."],
  },
  {
    title: "SECTION 7 – THIRD-PARTY WEBSITES AND PURCHASES",
    paragraphs: ["Our Platform may contain links or redirection options to external merchant websites and services.", "When users access these external websites:"],
    bullets: [
      "They become subject to the terms, conditions, and privacy policies of the respective third parties.",
      "Purchases, payments, deliveries, returns, refunds, and exchanges are handled directly by the relevant merchant.",
      "We are not responsible for transactions conducted outside our Platform.",
      "We do not control the content, security, availability, or operational practices of external websites.",
    ],
    after: ["Any disputes regarding products or purchases should be directed to the relevant merchant."],
  },
  {
    title: "SECTION 8 – USER CONDUCT AND PROHIBITED ACTIVITIES",
    paragraphs: ["Users agree not to:"],
    bullets: [
      "Use the Platform for illegal or unauthorized purposes.",
      "Submit false, misleading, or fraudulent information.",
      "Upload harmful, offensive, unlawful, or unauthorized images or content.",
      "Attempt to access another user’s account, Digital Twin, or private information.",
      "Interfere with the Platform’s functionality or security.",
      "Upload viruses, malware, or other harmful code.",
      "Copy, reproduce, distribute, or commercially exploit Platform content without permission.",
      "Scrape, extract, or collect data from the Platform without authorization.",
      "Attempt to reverse-engineer, disrupt, or compromise the Platform’s systems.",
    ],
    after: ["We reserve the right to restrict or terminate access for users who violate these conditions."],
  },
  {
    title: "SECTION 9 – INTELLECTUAL PROPERTY",
    paragraphs: [
      "All original Platform content, including its design, interface, branding, software, graphics, and original materials, is protected by applicable intellectual property laws.",
      "Users may not reproduce, modify, distribute, or commercially exploit these materials without prior authorization.",
      "Product images, logos, brand names, and other materials provided by merchants remain the property of their respective owners or rights holders.",
      "Their appearance on our Platform does not imply ownership or endorsement by us.",
    ],
  },
  {
    title: "SECTION 10 – PERSONAL INFORMATION AND PRIVACY",
    paragraphs: ["The collection and processing of personal information are governed by our Privacy Policy.", "Information that may be collected includes:"],
    bullets: [
      "Account and registration information.",
      "Uploaded Digital Twin photographs.",
      "Body measurements provided by users.",
      "Selected garments and try-on activity.",
      "Generated virtual try-on images.",
      "Technical and usage information.",
    ],
    after: [
      "We use this information to provide, maintain, and improve Platform functionality.",
      "Certain AI-powered features may require transmitting user images and garment images to third-party AI service providers for image generation.",
      "Users should review our Privacy Policy for further information about data collection, processing, storage, sharing, and protection.",
    ],
  },
  {
    title: "SECTION 11 – OPTIONAL SERVICES AND THIRD-PARTY TECHNOLOGIES",
    paragraphs: [
      "The Platform may rely on third-party services and technologies, including artificial intelligence APIs, cloud services, and external merchant websites.",
      "We do not control all aspects of these third-party services and cannot guarantee their uninterrupted availability, accuracy, or security.",
      "Use of such services may also be subject to the relevant third-party provider’s terms and policies.",
    ],
  },
  {
    title: "SECTION 12 – ACCURACY AND AVAILABILITY OF INFORMATION",
    paragraphs: ["We make reasonable efforts to provide accurate and up-to-date information.", "However:"],
    bullets: [
      "Product information may be outdated or incomplete.",
      "Prices and availability may change.",
      "Images and descriptions may differ from actual products.",
      "AI-generated previews may contain inaccuracies.",
      "Temporary technical issues may affect Platform functionality.",
    ],
    after: [
      "We reserve the right to correct errors, modify content, or discontinue features when necessary.",
      "Users should verify important product information directly with the relevant merchant.",
    ],
  },
  {
    title: "SECTION 13 – MODIFICATIONS AND SERVICE AVAILABILITY",
    paragraphs: [
      "We reserve the right to modify, suspend, or discontinue any part of the Platform or its services when necessary.",
      "We do not guarantee uninterrupted access to the Platform or that all features will always be available.",
      "Temporary interruptions may occur due to maintenance, technical failures, third-party service disruptions, or other circumstances beyond our control.",
    ],
  },
  {
    title: "SECTION 14 – DISCLAIMER OF WARRANTIES AND LIMITATION OF LIABILITY",
    paragraphs: ["The Platform and its services are provided on an “as is” and “as available” basis.", "To the extent permitted by applicable law, we do not guarantee:"],
    bullets: [
      "Uninterrupted or error-free Platform operation.",
      "Complete accuracy of merchant-provided product information.",
      "Perfect accuracy of AI-generated virtual try-on images.",
      "The quality, availability, or suitability of products offered by third-party merchants.",
      "The security or uninterrupted operation of external websites.",
    ],
    after: ["To the extent permitted by applicable law, we shall not be responsible for losses or damages arising from:"],
    secondBullets: [
      "Purchases or transactions conducted through external merchant websites.",
      "Inaccurate product information supplied by merchants.",
      "Differences between AI-generated previews and actual garments.",
      "Unauthorized access resulting from circumstances beyond our reasonable control.",
      "Temporary service interruptions or third-party service failures.",
    ],
    ending: ["Nothing in these Terms excludes or limits liability where such exclusion or limitation is prohibited by applicable law."],
  },
  {
    title: "SECTION 15 – INDEMNIFICATION",
    paragraphs: ["Users agree to indemnify and hold harmless the Platform and its operators, representatives, and service providers from claims, damages, liabilities, and reasonable expenses arising from:"],
    bullets: [
      "Their violation of these Terms and Conditions.",
      "Their unlawful use of the Platform.",
      "Their infringement of third-party rights.",
      "Content or images they upload without proper authorization.",
    ],
    after: ["This provision applies to the extent permitted by applicable law."],
  },
  {
    title: "SECTION 16 – TERMINATION OF ACCESS",
    paragraphs: ["We reserve the right to suspend, restrict, or terminate user access if:"],
    bullets: [
      "A user violates these Terms and Conditions.",
      "An account is involved in fraudulent or unauthorized activities.",
      "A user compromises Platform security or functionality.",
      "Continued access creates legal, security, or operational risks.",
    ],
    after: ["Users may discontinue using the Platform and request account or personal data deletion in accordance with our Privacy Policy and applicable requirements."],
  },
  {
    title: "SECTION 17 – SEVERABILITY",
    paragraphs: ["If any provision of these Terms and Conditions is determined to be invalid or unenforceable, the remaining provisions shall continue to apply to the extent permitted by applicable law."],
  },
  {
    title: "SECTION 18 – ENTIRE AGREEMENT",
    paragraphs: [
      "These Terms and Conditions, together with our Privacy Policy and other applicable Platform policies, constitute the agreement governing users’ access to and use of the Platform.",
      "They supersede any previous agreements or understandings relating to the same subject matter.",
    ],
  },
  {
    title: "SECTION 19 – GOVERNING LAW",
    paragraphs: [
      "These Terms and Conditions shall be governed by and interpreted in accordance with the laws of Sri Lanka, subject to applicable legal requirements.",
      "Any disputes arising from the use of the Platform shall be handled in accordance with the applicable laws and procedures of Sri Lanka.",
    ],
  },
  {
    title: "SECTION 20 – CHANGES TO THESE TERMS",
    paragraphs: [
      "We reserve the right to update, modify, or replace these Terms and Conditions when necessary.",
      "Updated versions will be published on the Platform with the revised effective date.",
      "Users are encouraged to review this page periodically. Continued use of the Platform following the publication of changes constitutes acceptance of the updated Terms, where permitted by applicable law.",
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="bg-gray-50 px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl"><GoBackButton /></div>
        <article className="mx-auto max-w-4xl rounded-3xl bg-white px-6 py-10 shadow-sm ring-1 ring-gray-200 sm:px-10 sm:py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-fuchsia-600">Universal Virtual Fitting Room</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Terms and Conditions</h1>
          <p className="mt-3 text-sm text-gray-500">Last Updated: 11 November 2026</p>
          <div className="mt-6 space-y-4 leading-7 text-gray-700">
            <p>Welcome to Universal Virtual Fitting Room (“Platform”, “we”, “us”, or “our”). These Terms and Conditions govern your access to and use of our website, services, and features.</p>
            <p>Our Platform provides a unified fashion discovery and virtual fitting experience, allowing users to explore garments from multiple merchants, compare products, and use AI-powered virtual try-on technology to visualize how selected garments may look on them.</p>
            <p>By accessing or using our Platform, you agree to comply with these Terms and Conditions. If you do not agree with any part of these terms, please discontinue using the Platform.</p>
          </div>

          <div className="mt-10 space-y-9">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-lg font-bold text-gray-900">{section.title}</h2>
                <div className="mt-3 space-y-3 leading-7 text-gray-700">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>
                      {paragraph.split("Privacy Policy").map((part, index, parts) => (
                        <Fragment key={index}>
                          {part}
                          {index < parts.length - 1 && <Link href="/privacy" className="font-medium text-fuchsia-700 underline">Privacy Policy</Link>}
                        </Fragment>
                      ))}
                    </p>
                  ))}
                  {section.bullets && (
                    <ul className="list-disc space-y-1 pl-6">
                      {section.bullets.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  )}
                  {section.subsections?.map((subsection) => (
                    <div key={subsection.title}>
                      <h3 className="font-semibold text-gray-900">{subsection.title}</h3>
                      <p>{subsection.text}</p>
                    </div>
                  ))}
                  {section.after?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  {section.secondBullets && (
                    <ul className="list-disc space-y-1 pl-6">
                      {section.secondBullets.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  )}
                  {section.ending?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </section>
            ))}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
