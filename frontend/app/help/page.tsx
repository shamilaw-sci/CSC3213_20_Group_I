import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HelpTopics from "./HelpTopics";
import GoBackButton from "@/app/components/GoBackButton";

export const metadata: Metadata = {
  title: "Help Center | Universal Virtual Fitting Room",
  description: "Find answers about accounts, Digital Twins, virtual try-on, products, merchants, and support.",
};

export default function HelpPage() {
  return (
    <>
      <Header />
      <main className="bg-gray-50 px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <GoBackButton />
          <HelpTopics />
        </div>
      </main>
      <Footer />
    </>
  );
}
