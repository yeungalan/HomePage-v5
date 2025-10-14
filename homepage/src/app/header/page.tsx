import { BottomToUpTransitionView } from "@/components/BottomToUpTransitionView";
import { TextUpTransitionView } from "@/components/TextUpTransitionView";
import WorldMap from "@/components/World";
import { motion } from 'motion/react'
import { createElement, useState, useEffect } from 'react'
import {LotteryText} from "@/components/LotteryText";
import { HeaderContent } from "@/components/header/HeaderContent";

export default function Page() {

  const htmlElements = [
    <span className="font-bold text-purple-600">Traveller!</span>,
    <span className="font-bold text-blue-600">Software Engineer!</span>,
    <span className="font-bold text-green-600">Photographer</span>,
    <span className="font-bold text-orange-600">Adventurer!</span>,
  ];

    return (
        <div className="min-w-screen bg-green">
          <HeaderContent/>
        </div>
    )
}