"use client"

import { BottomToUpTransitionView } from "@/components/BottomToUpTransitionView";
import { TextUpTransitionView } from "@/components/TextUpTransitionView";
import WorldMap from "@/components/World";
import { motion } from 'motion/react'
import { createElement, useState, useEffect } from 'react'
import {LotteryText} from "@/components/LotteryText";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ActivityPostList } from "@/components/ActivityPostList";
import Timeline from "@/components/Timeline";

export default function Page() {

    return (
        <div className="w-[500px] pl-[50px]">
         <ActivityPostList/>
         <Timeline/>
        </div>
    )
}