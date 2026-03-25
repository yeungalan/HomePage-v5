"use client"

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
