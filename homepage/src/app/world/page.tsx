"use client"

import { BottomToUpTransitionView } from "@/components/BottomToUpTransitionView";
import { TextUpTransitionView } from "@/components/TextUpTransitionView";
import { WorldMap } from "@/components/World";
import { motion } from 'motion/react'
import { createElement, useState, useEffect } from 'react'

export default function Page() {

    return (
        <div className="min-w-screen p-8 bg-green">
          <WorldMap/>
        </div>
    )
}