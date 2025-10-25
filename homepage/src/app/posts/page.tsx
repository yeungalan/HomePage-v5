"use client"

import { RealFooter } from "@/components/FooterLinks"
import { NormalContainer } from "@/components/NormalContainer"
import Post from "@/components/Post"
import { PostsList } from "@/components/PostList"

export default function Page() {
  return (
          <div className="flex min-h-screen flex-col">
      <div className="flex-1">
         <div className={"pt-5"}>


      <main className="mt-10 flex w-full flex-col">
        <PostsList/>
      </main>
    </div>
      </div>
      <RealFooter />
    </div>
  )
}