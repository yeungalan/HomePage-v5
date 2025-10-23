"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RealFooter } from "@/components/FooterLinks";
import Post from "@/components/Post";
import { FullPageLoading } from "@/components/Loading";
import { motion, AnimatePresence } from "framer-motion";

export default function Page() {
  const { slug } = useParams(); // ✅ Get dynamic route param
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!slug) return; // Avoid fetching before param is ready

    fetch(`/posts_md/${slug}.md`)
      .then((response) => {
        if (!response.ok) throw new Error("Markdown not found");
        return response.text();
      })
      .then((content) => {
        setMarkdownContent(content);
        setIsLoading(false);
      })
      .catch((error) => console.error("Error loading markdown:", error));
  }, [slug]);

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <FullPageLoading />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <Post markdownContent={markdownContent} />
          </motion.div>
        )}
      </AnimatePresence>

      <RealFooter />
    </div>
  );
}
