import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Privacy Policy | Universal Virtual Fitting Room",
  description: "Learn how Universal Virtual Fitting Room collects, uses, stores, and shares personal information.",
};

type PolicySubsection = { title: string; paragraphs?: string[]; bullets?: string[]; after?: string[] };
type PolicySection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  subsections?: PolicySubsection[];
  after?: string[];
  ordered?: string[];
};

const sections: PolicySection[] = [
  {
    title: "1. PERSONAL INFORMATION WE COLLECT",
    paragraphs: ["We collect different types of information depending on how you interact with our Platform."],
    subsections: [
      {
        title: "1.1 Account Information",
        paragraphs: ["When you create an account, we may collect:"],
        bullets: ["Full name", "Email address", "Username", "Password (stored securely in encrypted or hashed form)", "Other information you voluntarily provide through your account."],
      },
      {
        title: "1.2 Digital Twin Information",
        paragraphs: ["If you choose to create a Digital Twin, we may collect personal information required to create and maintain your virtual body profile, including:"],
        bullets: ["Uploaded photographs of yourself.", "Body measurements, such as height, weight, chest, waist, and hip measurements.", "Other information you voluntarily provide to improve your Digital Twin experience."],
        after: ["This information is used to support personalized virtual try-on features.", "Your Digital Twin information is personal and sensitive in nature. We use it only for the purposes explained in this Privacy Policy and apply appropriate measures to protect it from unauthorized access, use, or disclosure."],
      },
      {
        title: "1.3 Virtual Try-On Information",
        paragraphs: ["When you use our AI-powered virtual try-on feature, we may collect and process:"],
        bullets: ["Your Digital Twin image or an image uploaded for a temporary try-on.", "Images of the garments you select from the Platform.", "Selected garment details, such as size, colour, and product information.", "AI-generated virtual try-on images.", "Virtual try-on history and related session information."],
        after: ["These details help us provide the virtual try-on service and allow you to access your previous try-on results where that feature is available."],
      },
      {
        title: "1.4 Device and Usage Information",
        paragraphs: ["When you visit our Platform, certain technical information may be collected automatically, including:"],
        bullets: ["IP address.", "Browser type and version.", "Device type and operating system.", "Date and time of access.", "Pages and products viewed.", "Interactions with Platform features.", "Referring websites and navigation activity."],
        after: ["We use this information to maintain the security, functionality, and performance of our Platform."],
      },
      {
        title: "1.5 Merchant and Product Interaction Information",
        paragraphs: ["When you browse products or interact with merchant listings, we may collect information about:"],
        bullets: ["Products and merchants you view.", "Product categories and preferences.", "Search and browsing activity.", "Links you select to visit external merchant websites."],
        after: ["When you leave our Platform through a merchant link, the merchant’s own privacy policy and practices apply to your activities on their website."],
      },
    ],
  },
  {
    title: "2. HOW DO WE USE YOUR PERSONAL INFORMATION?",
    paragraphs: ["We use the information we collect for the following purposes:"],
    bullets: [
      "Account Management: To create and manage user accounts, authenticate users, and provide access to Platform features.",
      "Digital Twin Creation: To create, maintain, and manage personalized Digital Twin profiles.",
      "AI Virtual Try-On: To process uploaded images and selected garment images to generate virtual try-on results.",
      "Fashion Discovery: To display products from different merchants and help users explore and compare available fashion items.",
      "Personalization: To improve the relevance of product discovery and the overall user experience.",
      "Communication: To respond to inquiries, provide service-related notifications, and communicate important updates.",
      "Platform Improvement: To understand how users interact with our Platform and improve its features, usability, and performance.",
      "Security: To detect suspicious activities, prevent unauthorized access, and protect the Platform and its users.",
      "Legal Compliance: To comply with applicable laws, regulations, and lawful requests from relevant authorities.",
    ],
    after: ["We do not use your Digital Twin photographs or body measurements for unrelated purposes without an appropriate legal basis or your consent where required."],
  },
  {
    title: "3. SHARING YOUR PERSONAL INFORMATION",
    paragraphs: ["We may share certain information with third parties when necessary to operate and improve our Platform."],
    subsections: [
      {
        title: "3.1 AI Service Providers",
        paragraphs: ["Our AI-powered virtual try-on feature may use third-party AI services, such as Google’s Gemini API, to generate virtual try-on images.", "When you use this feature, relevant images and instructions may be transmitted to the AI service provider for processing.", "The information shared may include:"],
        bullets: ["Your Digital Twin or uploaded photograph.", "The selected garment image.", "Relevant instructions required to generate the virtual try-on result."],
        after: ["These providers process information according to their own terms, privacy policies, and applicable data-processing practices.", "We encourage users to review the relevant third-party privacy policies before using AI-powered features."],
      },
      {
        title: "3.2 Technical and Hosting Service Providers",
        paragraphs: ["We may use third-party service providers for hosting, database management, image storage, authentication, application maintenance, and other technical services.", "These providers may process information on our behalf where necessary to operate the Platform."],
      },
      {
        title: "3.3 Fashion Merchants",
        paragraphs: ["Our Platform connects customers with independent fashion merchants.", "When you select a product and choose to visit a merchant’s website, you may be redirected to an external website. The merchant may collect information directly from you according to its own privacy policy.", "We do not control how external merchants collect, use, or store your personal information."],
      },
      {
        title: "3.4 Legal Requirements",
        paragraphs: ["We may disclose your information when required by applicable laws or regulations, or when we reasonably believe disclosure is necessary to:"],
        bullets: ["Respond to lawful requests from government authorities.", "Comply with legal obligations.", "Protect the rights, property, and safety of our users or our Platform.", "Investigate fraud, security incidents, or unauthorized activities."],
      },
    ],
    after: ["We do not sell your personal information to third parties."],
  },
  {
    title: "4. AI-POWERED VIRTUAL TRY-ON AND IMAGE PROCESSING",
    paragraphs: ["Our Platform provides an AI-powered virtual try-on feature that allows users to visualize selected garments on their Digital Twin or uploaded photographs.", "When you request a virtual try-on:"],
    ordered: ["Your Digital Twin or uploaded image is retrieved for processing.", "The selected garment image is obtained from the product listing.", "Relevant images and instructions are sent to the AI service provider.", "An AI-generated image is returned and displayed on the Platform.", "Where applicable, the generated result may be saved in your virtual try-on history."],
    after: ["Please note that AI-generated images are visual representations and may not accurately reflect the actual fit, size, fabric, colour, texture, or appearance of a garment.", "We recommend using these results as a visual reference rather than a guarantee of how a garment will look or fit in real life."],
  },
  {
    title: "5. COOKIES AND SIMILAR TECHNOLOGIES",
    paragraphs: ["Our Platform may use cookies and similar technologies to improve functionality and understand how users interact with our services.", "These technologies may be used to:"],
    bullets: ["Maintain user sessions and login status.", "Remember certain user preferences.", "Improve website performance and usability.", "Understand Platform usage and generate analytics.", "Support security and fraud prevention."],
    after: ["You may manage or disable cookies through your browser settings. However, disabling certain cookies may affect the availability or functionality of some Platform features."],
  },
  {
    title: "6. DATA SECURITY",
    paragraphs: ["We take reasonable technical and organizational measures to protect personal information against unauthorized access, alteration, disclosure, loss, or misuse.", "These measures may include:"],
    bullets: ["Secure authentication mechanisms.", "Password hashing.", "Access restrictions.", "Secure data transmission.", "Protection of stored personal information.", "Appropriate safeguards for uploaded photographs and Digital Twin information."],
    after: ["However, no method of internet transmission or electronic storage is completely secure. Therefore, we cannot guarantee absolute security of your information."],
  },
  {
    title: "7. DATA RETENTION",
    paragraphs: ["We retain personal information only for as long as reasonably necessary to provide our services, fulfil the purposes described in this Privacy Policy, and comply with applicable legal obligations.", "In particular:"],
    bullets: ["Account Information: Retained while your account remains active or as required for legitimate operational or legal purposes.", "Digital Twin Information: Retained to provide your Digital Twin and related features until you delete it, close your account, or it is otherwise no longer required.", "Virtual Try-On History: Generated images and related records may be retained until you delete them or they are no longer needed for the service.", "Device and Usage Information: Retained for security, analytics, and operational purposes for an appropriate period."],
    after: ["When information is no longer required, we will take reasonable steps to delete or securely dispose of it, subject to applicable legal requirements and technical limitations."],
  },
  {
    title: "8. YOUR PRIVACY RIGHTS",
    paragraphs: ["Depending on applicable laws and regulations, you may have the right to:"],
    bullets: ["Request access to personal information we hold about you.", "Request correction of inaccurate or incomplete information.", "Request deletion of your personal information.", "Delete or update your Digital Twin information where the relevant functionality is available.", "Request information about how your personal information is processed.", "Withdraw consent where processing is based on your consent.", "Raise concerns or complaints regarding the handling of your personal information."],
    after: ["To exercise these rights, please contact us using the contact details provided in this Privacy Policy.", "We may need to verify your identity before processing certain requests."],
  },
  {
    title: "9. THIRD-PARTY WEBSITES",
    paragraphs: ["Our Platform may contain links to external websites operated by independent fashion merchants and other third-party service providers.", "When you access these websites, you leave our Platform and become subject to their respective privacy policies, terms, and practices.", "We are not responsible for the privacy practices, content, security, or services provided by external websites.", "We recommend reviewing the privacy policy of each external website before providing any personal information."],
  },
  {
    title: "10. CHILDREN’S PRIVACY",
    paragraphs: ["Our Platform is not intended for individuals under the age of 18.", "We do not knowingly collect personal information from individuals under the age of 18. If we become aware that personal information has been collected from an individual under this age without the necessary legal basis or authorization, we will take appropriate steps to address the situation."],
  },
  {
    title: "11. INTERNATIONAL DATA PROCESSING",
    paragraphs: ["Some third-party service providers used by our Platform may process or store information in countries outside Sri Lanka.", "As a result, your personal information may be transferred to and processed in other jurisdictions where those providers operate.", "Where required, we will take appropriate steps to ensure that such transfers comply with applicable data protection laws and provide suitable safeguards for your information."],
  },
  {
    title: "12. DO NOT TRACK",
    paragraphs: ["Some web browsers provide a “Do Not Track” feature that allows users to indicate their preferences regarding online tracking.", "Our Platform may not respond to all Do Not Track signals. You can manage certain tracking preferences through your browser settings and any privacy controls made available on the Platform."],
  },
  {
    title: "13. CHANGES TO THIS PRIVACY POLICY",
    paragraphs: ["We may update this Privacy Policy from time to time to reflect changes in our services, technology, data-processing practices, or applicable legal and regulatory requirements.", "Any updates will be published on this page with a revised “Last Updated” date.", "We encourage users to review this page periodically to stay informed about how their personal information is handled."],
  },
  {
    title: "14. CONTACT US",
    paragraphs: ["If you have any questions, concerns, or requests regarding this Privacy Policy or the handling of your personal information, please contact us through our Platform’s contact or support channels.", "Universal Virtual Fitting Room", "Email: www.tryvora.com", "Website: tryvora@example.com", "Location: Sri Lanka"],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="bg-gray-50 px-6 py-12 sm:py-16">
        <article className="mx-auto max-w-4xl rounded-3xl bg-white px-6 py-10 shadow-sm ring-1 ring-gray-200 sm:px-10 sm:py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-fuchsia-600">Universal Virtual Fitting Room</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Privacy Policy</h1>
          <p className="mt-3 text-sm text-gray-500">Last Updated: 14 November 2026</p>
          <div className="mt-6 space-y-4 leading-7 text-gray-700">
            <p>This Privacy Policy explains how Universal Virtual Fitting Room (“we”, “our”, or “us”) collects, uses, stores, and shares your personal information when you access or use our website and services (the “Platform”).</p>
            <p>Our Platform provides a fashion discovery experience that connects customers with multiple fashion merchants. It also offers features such as Digital Twin profiles and AI-powered virtual try-on to help users explore how different garments may look on them.</p>
            <p>By accessing or using our Platform, you acknowledge that you have read and understood this Privacy Policy.</p>
          </div>

          <div className="mt-10 space-y-9">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-lg font-bold text-gray-900">{section.title}</h2>
                <div className="mt-3 space-y-3 leading-7 text-gray-700">
                  {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  {section.bullets && (
                    <ul className="list-disc space-y-1 pl-6">
                      {section.bullets.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  )}
                  {section.ordered && (
                    <ol className="list-decimal space-y-1 pl-6">
                      {section.ordered.map((item) => <li key={item}>{item}</li>)}
                    </ol>
                  )}
                  {section.subsections?.map((subsection) => (
                    <div key={subsection.title} className="space-y-3">
                      <h3 className="pt-2 font-semibold text-gray-900">{subsection.title}</h3>
                      {subsection.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                      {subsection.bullets && (
                        <ul className="list-disc space-y-1 pl-6">
                          {subsection.bullets.map((item) => <li key={item}>{item}</li>)}
                        </ul>
                      )}
                      {subsection.after?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                    </div>
                  ))}
                  {section.after?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
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
