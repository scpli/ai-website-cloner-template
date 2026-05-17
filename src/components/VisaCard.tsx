"use client";

import { useState } from "react";
import { ChevronRightSvg } from "@/components/icons";

interface VisaCardProps {
  number: number;
  title: string;
  intro?: string;
  qualifications: { label: string; items: string[] }[];
  stayDuration: string;
  talentListLink?: { label: string; href: string };
  techSpecialistLink?: { label: string; href: string };
  techSpecialistListLink?: { label: string; href: string };
  eligibleUniLink?: { label: string; href: string };
  talentListNote?: string;
  applyLink?: { label: string; href: string };
}

export default function VisaCard({
  number,
  title,
  intro,
  qualifications,
  stayDuration,
  talentListLink,
  techSpecialistLink,
  techSpecialistListLink,
  eligibleUniLink,
  talentListNote,
  applyLink,
}: VisaCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="scheme relative rounded border border-[#D7D7D7] mb-10 last:mb-0 transition-all ease-in-out duration-200 hover:shadow-lg">
      {/* Background overlay */}
      <div className="absolute inset-0 size-full bg-[#f5f5f5] opacity-70" />

      <div className="relative px-8 sm:px-12 py-8">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-8 h-8 text-[#363636] text-lg font-bold">
            {number}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-[#363636] uppercase">
              {title}
            </h3>
          </div>
        </div>

        {/* Qualifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {qualifications.map((col, colIdx) => (
            <div key={colIdx}>
              <h4 className="text-sm font-bold text-[#363636] uppercase mb-3">
                {col.label}
              </h4>
              {colIdx === 0 && intro && (
                <p className="text-sm text-[#363636] mb-3">{intro}</p>
              )}
              <ul className="space-y-1 text-sm text-[#363636]">
                {col.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#363636] mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {/* Inline links after qualifications */}
              {colIdx === 0 && talentListLink && (
                <p className="mt-3 text-sm">
                  <a href={talentListLink.href} className="text-[#E00004] hover:underline">
                    {talentListLink.label}
                  </a>
                </p>
              )}
              {colIdx === 0 && techSpecialistLink && (
                <p className="mt-2 text-sm">
                  <a href={techSpecialistLink.href} className="text-[#E00004] hover:underline">
                    {techSpecialistLink.label}
                  </a>
                  {techSpecialistListLink && (
                    <>
                      ，並且只限載列於「
                      <a href={techSpecialistListLink.href} className="text-[#E00004] hover:underline">
                        技術專才清單
                      </a>
                      」的指定技術工種。
                    </>
                  )}
                </p>
              )}
              {colIdx === 0 && eligibleUniLink && (
                <p className="mt-2 text-sm">
                  <a href={eligibleUniLink.href} className="text-[#E00004] hover:underline">
                    {eligibleUniLink.label}
                  </a>
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Stay duration */}
        <div className="pt-4 border-t border-[#d7d7d7]">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-[#363636] uppercase">
              逗留期限
            </h4>
            <div className="flex items-center gap-4">
              {applyLink && (
                <a
                  href={applyLink.href}
                  className="flex items-center gap-1 bg-[#E00004] text-white text-sm font-medium px-4 py-1.5 rounded-full hover:opacity-80 transition-opacity"
                >
                  立即申請
                  <ChevronRightSvg className="w-4 h-4" />
                </a>
              )}
              <button
                className="w-9 h-9 rounded-full border-2 border-[#E00004] flex items-center justify-center hover:bg-[#E00004] transition-colors group"
                onClick={() => setExpanded(!expanded)}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={`transition-transform duration-200 ${expanded ? "rotate-45" : ""}`}>
                  <path d="M7 2v10M2 7h10" stroke="currentColor" className="text-[#E00004] group-hover:text-white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Expanded content */}
          {expanded && (
            <div className="mt-4 text-sm text-[#363636] space-y-2">
              <p>{stayDuration}</p>
              {talentListNote && (
                <p className="mt-2">{talentListNote}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
