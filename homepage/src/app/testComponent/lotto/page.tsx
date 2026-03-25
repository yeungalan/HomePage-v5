"use client"

import {LotteryText} from "@/components/LotteryText";

export default function Page() {

  const htmlElements = [
    <span key="traveller" className="font-bold text-purple-600">Traveller!</span>,
    <span key="engineer" className="font-bold text-blue-600">Software Engineer!</span>,
    <span key="photographer" className="font-bold text-green-600">Photographer</span>,
    <span key="adventurer" className="font-bold text-orange-600">Adventurer!</span>,
  ];

    return (
        <div className="min-w-screen bg-green">
          I&apos;m a&nbsp;
                      <LotteryText elements={htmlElements} className="text-purple-600" />
        </div>
    )
}
