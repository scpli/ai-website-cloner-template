"use client";

import { useState, useRef, useEffect } from "react";

type Region = "mainland" | "taiwan_macao" | "other_country" | "";

interface Question {
  id: string;
  text: string;
  options: { value: string; label: string }[];
}

// All questions from the original site (zh-HK Traditional Chinese)
const allQuestions: Record<string, Omit<Question, "id">> = {
  "1": {
    text: "Q1. 你來自哪個地區？",
    options: [
      { value: "mainland", label: "中國內地" },
      { value: "taiwan_macao", label: "台灣 / 澳門特別行政區" },
      { value: "other_country", label: "中國以外地區" },
    ],
  },
  "1a": {
    text: "Q1a. 你是來自海外的中國籍香港永久性居民第二代嗎？",
    options: [
      { value: "yes", label: "是" },
      { value: "no", label: "否" },
    ],
  },
  "2": {
    text: "Q2. 你持有學士學位或以上的學歷嗎？",
    options: [
      { value: "yes", label: "是" },
      { value: "no", label: "否" },
    ],
  },
  "2a": {
    text: "Q2a. 你是在香港修畢全日制經本地評審的學士學位或更高資歷課程的畢業生嗎？",
    options: [
      { value: "yes", label: "是" },
      { value: "no", label: "否" },
    ],
  },
  "2b": {
    text: "Q2b. 你是在合資格大學名單上的國際知名大學學士學位的畢業生嗎？",
    options: [
      { value: "yes", label: "是" },
      { value: "no", label: "否" },
    ],
  },
  "3": {
    text: "Q3. 你是應屆畢業生嗎？",
    options: [
      { value: "yes", label: "是" },
      { value: "no", label: "否" },
    ],
  },
  "3a": {
    text: "Q3a. 你是否在過去五年內累積了三年或以上的工作經驗？",
    options: [
      { value: "yes", label: "是" },
      { value: "no", label: "否" },
    ],
  },
  "3b": {
    text: "Q3b. 你是否在過去五年內畢業？",
    options: [
      { value: "yes", label: "是" },
      { value: "no", label: "否" },
    ],
  },
  "4": {
    text: "Q4. 於過去一年，你的年薪是否達港幣二百五十萬或以上？",
    options: [
      { value: "yes", label: "是" },
      { value: "no", label: "否" },
    ],
  },
  "5": {
    text: "Q5. 你是否已在香港找到工作？",
    options: [
      { value: "yes", label: "是" },
      { value: "no", label: "否" },
    ],
  },
  "5a": {
    text: "Q5a. 你從事與創新科技研發相關的工作（例如：5G通訊、人工智能、網絡安全等）？",
    options: [
      { value: "yes", label: "是" },
      { value: "no", label: "否" },
    ],
  },
  "6": {
    text: "Q6. 你認為自己是具備良好技術或資歷的高技術人才或優才嗎？",
    options: [
      { value: "yes", label: "是" },
      { value: "no", label: "否" },
    ],
  },
  "7": {
    text: "Q7. 你是否打算在香港創業？",
    options: [
      { value: "yes", label: "是" },
      { value: "no", label: "否" },
    ],
  },
};

// Decision tree: maps question ID + answer -> next question ID
const decisionTree: Record<string, Record<string, string>> = {
  "1": {
    mainland: "2",
    taiwan_macao: "2",
    other_country: "1a",
  },
  "1a": {
    yes: "2",
    no: "2",
  },
  "2": {
    yes: "2a",
    no: "4",
  },
  "2a": {
    yes: "2b",
    no: "2b",
  },
  "2b": {
    yes: "3",
    no: "3",
  },
  "3": {
    yes: "4",
    no: "3a",
  },
  "3a": {
    yes: "3b",
    no: "3b",
  },
  "3b": {
    yes: "4",
    no: "4",
  },
  "4": {
    yes: "5",
    no: "5",
  },
  "5": {
    yes: "5a",
    no: "5a",
  },
  "5a": {
    yes: "6",
    no: "6",
  },
  "6": {
    yes: "7",
    no: "7",
  },
  // "7" is the last question (no next)
};

// Get the full question path for a given region and answers
function getNextQuestionId(
  currentId: string,
  answer: string
): string | null {
  const transitions = decisionTree[currentId];
  if (!transitions) return null;
  return transitions[answer] || null;
}

// Get all questions that were reached in the user's decision path
function getReachedQuestions(region: Region, answers: Record<string, string>): Set<string> {
  const reached = new Set<string>();
  reached.add("1"); // Always reached

  let currentId: string | null = decisionTree["1"][region] || null;
  while (currentId) {
    reached.add(currentId);
    const answer = answers[currentId];
    if (answer === undefined) break;
    currentId = getNextQuestionId(currentId, answer);
  }
  return reached;
}

// Determine which visa schemes are suitable based on the original site's questionnaire logic.
// Each scheme has specific eligibility requirements. A scheme is shown if the user meets them.
function getMatchingSchemes(
  region: Region,
  answers: Record<string, string>
): number[] {
  const result: number[] = [];

  // Helper: get answer safely
  const a = (id: string) => answers[id] || "";

  // Scheme 1: 高端人才通行證計劃 (Top Talent Pass Scheme)
  // Shown if: high income (Q4=yes) OR has eligible degree (Q2=yes with Q2b=yes)
  // The scheme has A category (high income), B/C categories (eligible degree)
  const hasHighIncome = a("4") === "yes";
  const hasEligibleDegree = a("2") === "yes" && a("2b") === "yes";
  if (hasHighIncome || hasEligibleDegree) {
    result.push(1);
  }

  // Scheme 2: 一般就業政策 (General Employment Policy) - for non-Mainland
  // Shown if: has confirmed job offer (Q5=yes) AND not from mainland
  const hasJobOffer = a("5") === "yes";
  const isNonMainland = region === "taiwan_macao" || region === "other_country";
  if (hasJobOffer && isNonMainland) {
    result.push(2);
  }

  // Scheme 3: 輸入內地人才計劃 (Mainland Talents) - for Mainland residents
  // Shown if: from mainland AND has confirmed job offer (Q5=yes)
  if (region === "mainland" && hasJobOffer) {
    result.push(3);
  }

  // Scheme 4: 非本地畢業生留港／回港就業安排 (IANG)
  // Shown if: is HK graduate (Q2a=yes)
  const isHKGraduate = a("2a") === "yes";
  if (isHKGraduate) {
    result.push(4);
  }

  // Scheme 5: 優秀人才入境計劃 (Quality Migrant Admission Scheme)
  // Shown if: considers themselves top talent (Q6=yes)
  const isTopTalent = a("6") === "yes";
  if (isTopTalent) {
    result.push(5);
  }

  // Scheme 6: 科技人才入境計劃 (Tech Talent Admission Scheme)
  // Shown if: has job offer (Q5=yes) AND works in tech (Q5a=yes)
  // Requires employer to have quota from Innovation & Tech dept
  const inTech = a("5a") === "yes";
  if (hasJobOffer && inTech) {
    result.push(6);
  }

  // Scheme 7: 輸入中國籍香港永久性居民第二代計劃 (Second Generation)
  // Shown if: is 2nd gen HK PR (Q1a=yes)
  const isSecondGen = a("1a") === "yes";
  if (isSecondGen) {
    result.push(7);
  }

  return result.length > 0 ? result : [1, 2, 3, 4, 5, 6, 7];
}

export default function VisaQuestionnaireSection({
  onSchemeHighlight,
}: {
  onSchemeHighlight?: (schemeNumbers: number[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [region, setRegion] = useState<Region>("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionId, setCurrentQuestionId] = useState("1");
  const sectionRef = useRef<HTMLElement>(null);

  // Expose scrollTo method for the floating button
  useEffect(() => {
    const handleScrollToTool = () => {
      setIsOpen(true);
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    };

    window.addEventListener("scrollToVisaTool", handleScrollToTool);
    return () =>
      window.removeEventListener("scrollToVisaTool", handleScrollToTool);
  }, []);

  const currentQuestion: Question | null = currentQuestionId
    ? { id: currentQuestionId, ...allQuestions[currentQuestionId] }
    : null;

  // Check if current question is the last one (Q7)
  const isLastStep = currentQuestionId === "7";
  const hasAnswer =
    currentQuestion && answers[currentQuestion.id] !== undefined;

  const handleSelect = (value: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    if (!hasAnswer || !currentQuestion) return;

    const answer = answers[currentQuestion.id];
    const nextId = getNextQuestionId(currentQuestion.id, answer);

    if (isLastStep || !nextId) {
      // Show results
      const matched = getMatchingSchemes(region, answers);
      onSchemeHighlight?.(matched);
      setTimeout(() => {
        const visaSection = document.getElementById("visa-cards-section");
        if (visaSection) {
          visaSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);
    } else {
      setCurrentQuestionId(nextId);
    }
  };

  const handleBack = () => {
    // Navigate back through answered questions
    const answeredIds = Object.keys(answers).filter((id) => id !== "1");
    if (answeredIds.length === 0) {
      // Go back to region selection
      setRegion("");
      setCurrentQuestionId("1");
      setAnswers({});
      return;
    }

    // Find the previous question by reversing the decision tree
    // Simple approach: remove the last answered question and go back
    const lastAnsweredId = answeredIds[answeredIds.length - 1];
    const prevAnswers = { ...answers };
    delete prevAnswers[lastAnsweredId];
    setAnswers(prevAnswers);

    // Find the question that leads to lastAnsweredId
    for (const [qid, transitions] of Object.entries(decisionTree)) {
      for (const [ans, nextId] of Object.entries(transitions)) {
        if (nextId === lastAnsweredId && prevAnswers[qid] === ans) {
          setCurrentQuestionId(qid);
          return;
        }
      }
    }

    // Fallback: go to Q1
    setCurrentQuestionId("1");
  };

  const handleReset = () => {
    setRegion("");
    setAnswers({});
    setCurrentQuestionId("1");
  };

  // Count total steps for display (approximate based on path)
  const stepNumber = Object.keys(answers).length + 1;

  return (
    <section
      ref={sectionRef}
      id="visa_tool"
      className={`relative bg-[#4D2D52] text-white transition-all duration-500 ${
        isOpen ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
      }`}
    >
      {/* Background mask overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url(/images/bg-n-mask.png)",
          mixBlendMode: "soft-light",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "left bottom",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1140px] px-5 lg:px-0 py-16 lg:py-24">
        <h2 className="text-[32px] md:text-[40px] font-bold leading-tight mb-4">
          入境計劃配對工具
        </h2>
        <p className="text-white/80 text-justify mb-8 max-w-2xl">
          香港特別行政區政府為有意來港工作及定居的專業人才提供七項人才入境計劃。回答以下問題，只需五分鐘即可快速評估符合申請資格的計劃。
        </p>

        {/* Questionnaire */}
        {region === "" ? (
          /* Q1: Region selection */
          <div className="max-w-2xl">
            <h3 className="text-lg font-bold mb-6">
              Q1. 你來自哪個地區？
            </h3>
            <div className="flex flex-col lg:flex-row w-full gap-2 lg:gap-4 mb-8">
              {[
                { value: "mainland" as Region, label: "中國內地" },
                {
                  value: "taiwan_macao" as Region,
                  label: "台灣 / 澳門特別行政區",
                },
                { value: "other_country" as Region, label: "中國以外地區" },
              ].map((option) => {
                const isSelected = region === option.value;
                return (
                  <label
                    key={option.value}
                    className={`flex gap-x-2.5 lg:gap-x-3 items-center min-h-12 border rounded-lg px-4 lg:px-5 py-2 cursor-pointer transition-all ease-in-out duration-200 ${
                      isSelected
                        ? "border-[#5B8DEF] bg-white/10"
                        : "border-[#545454] bg-white"
                    }`}
                  >
                    <span className="relative block w-5 h-5 min-w-5 min-h-5">
                      <input
                        type="radio"
                        name="region"
                        value={option.value}
                        checked={region === option.value}
                        onChange={() => setRegion(option.value)}
                        className="hidden"
                      />
                      <span
                        className={`relative inline-block size-full border-2 rounded-full transition-all ease-in-out duration-200 ${
                          isSelected
                            ? "border-[#5B8DEF]"
                            : "border-[#545454]"
                        }`}
                      >
                        <span
                          className={`absolute inset-0 flex items-center justify-center transition-all ease-in-out duration-200 ${
                            isSelected ? "bg-[#5B8DEF]" : "bg-transparent"
                          }`}
                          style={{
                            width: isSelected ? "10px" : "0px",
                            height: isSelected ? "10px" : "0px",
                            margin: "auto",
                            borderRadius: "50%",
                          }}
                        />
                      </span>
                    </span>
                    <span
                      className={`text-sm transition-colors duration-200 ${
                        isSelected
                          ? "text-[#5B8DEF] font-medium"
                          : "text-[#545454] font-normal"
                      }`}
                    >
                      {option.label}
                    </span>
                  </label>
                );
              })}
            </div>
            <button
              onClick={() => {
                if (region) {
                  setAnswers({ "1": region });
                  const nextId = decisionTree["1"][region];
                  if (nextId) {
                    setCurrentQuestionId(nextId);
                  }
                }
              }}
              disabled={!region}
              className={`w-full md:w-max inline-block px-8 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                region
                  ? "text-white hover:opacity-80"
                  : "text-white/30 pointer-events-none grayscale"
              }`}
            >
              下一步
            </button>
          </div>
        ) : currentQuestion ? (
          /* Follow-up questions */
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-6 text-white/50 text-sm">
              <button
                onClick={handleBack}
                className="hover:text-white transition-colors"
              >
                ← 返回
              </button>
              <span>|</span>
              <span>問題 {stepNumber}</span>
            </div>
            <h3 className="text-lg font-bold mb-6">
              {currentQuestion.text}
            </h3>
            <div className="flex flex-col gap-3 mb-8">
              {currentQuestion.options.map((option) => {
                const isSelected =
                  answers[currentQuestion.id] === option.value;
                return (
                  <label
                    key={option.value}
                    className={`flex gap-x-2.5 lg:gap-x-3 items-center min-h-12 border rounded-lg px-4 lg:px-5 py-2 cursor-pointer transition-all ease-in-out duration-200 ${
                      isSelected
                        ? "border-[#5B8DEF] bg-white/10"
                        : "border-[#545454] bg-white"
                    }`}
                  >
                    <span className="relative block w-5 h-5 min-w-5 min-h-5">
                      <input
                        type="radio"
                        name={currentQuestion.id}
                        value={option.value}
                        checked={isSelected}
                        onChange={() => handleSelect(option.value)}
                        className="hidden"
                      />
                      <span
                        className={`relative inline-block size-full border-2 rounded-full transition-all ease-in-out duration-200 ${
                          isSelected
                            ? "border-[#5B8DEF]"
                            : "border-[#545454]"
                        }`}
                      >
                        <span
                          className={`absolute inset-0 flex items-center justify-center transition-all ease-in-out duration-200 ${
                            isSelected ? "bg-[#5B8DEF]" : "bg-transparent"
                          }`}
                          style={{
                            width: isSelected ? "10px" : "0px",
                            height: isSelected ? "10px" : "0px",
                            margin: "auto",
                            borderRadius: "50%",
                          }}
                        />
                      </span>
                    </span>
                    <span
                      className={`text-sm transition-colors duration-200 ${
                        isSelected
                          ? "text-[#5B8DEF] font-medium"
                          : "text-[#545454] font-normal"
                      }`}
                    >
                      {option.label}
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleNext}
                disabled={!hasAnswer}
                className={`w-full md:w-max inline-block px-8 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  hasAnswer
                    ? "text-white hover:opacity-80"
                    : "text-white/30 pointer-events-none grayscale"
                }`}
              >
                {isLastStep ? "查看結果" : "下一步"}
              </button>
              <button
                onClick={handleReset}
                className="text-white/50 hover:text-white text-sm transition-colors"
              >
                重新開始
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
