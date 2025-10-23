"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RealFooter } from "@/components/FooterLinks";
import Post from "@/components/Post";

export default function Page() {
  const { slug } = useParams(); // ✅ Get dynamic route param
  const [markdownContent, setMarkdownContent] = useState<string>("");

  useEffect(() => {
    if (!slug) return; // Avoid fetching before param is ready

    fetch(`/posts_md/${slug}.md`)
      .then((response) => {
        if (!response.ok) throw new Error("Markdown not found");
        return response.text();
      })
      .then((content) => setMarkdownContent(content))
      .catch((error) => console.error("Error loading markdown:", error));
  }, [slug]);

  return (
    <div>
      <Post markdownContent={markdownContent} />
      <RealFooter />
    </div>
  );
}
