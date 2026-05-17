"use client";

import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import IntroSection from "@/components/IntroSection";
import VisaQuestionnaireSection from "@/components/VisaQuestionnaireSection";
import VisaCardsSection from "@/components/VisaCardsSection";
import BottomSections from "@/components/BottomSections";
import Footer from "@/components/Footer";
import VisaFilterButton from "@/components/VisaFilterButton";
import ChatbotButton from "@/components/ChatbotButton";

export default function Home() {
  const [matchedSchemes, setMatchedSchemes] = useState<number[] | null>(null);

  return (
    <main className="min-h-screen">
      <Header />
      {/* Content starts after fixed header */}
      <div className="relative">
        <HeroSection />
        <IntroSection />
        <VisaQuestionnaireSection onSchemeHighlight={setMatchedSchemes} />
        <VisaCardsSection matchedSchemes={matchedSchemes} />
        <BottomSections />
        {/* Floating visa filter button */}
        <VisaFilterButton />
        {/* Chatbot floating button */}
        <ChatbotButton />
      </div>
      <Footer />
    </main>
  );
}
