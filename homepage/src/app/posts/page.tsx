"use client"

import { RealFooter } from "@/components/FooterLinks"
import Post from "@/components/Post"
import { useEffect, useState } from "react"

export default function Page() {
  const [markdownContent, setMarkdownContent] = useState<string>("")

  useEffect(() => {
    // Load markdown file
    fetch('./posts_md/sample.md')
      .then(response => response.text())
      .then(content => setMarkdownContent(content))
      .catch(error => console.error('Error loading markdown:', error))
  }, [])

  return (
    <div>
      <Post markdownContent={markdownContent} />
      <RealFooter/>
    </div>
  )
}