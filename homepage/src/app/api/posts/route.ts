import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  const postsDirectory = path.join(process.cwd(), 'public/posts_md')
  const filenames = fs.readdirSync(postsDirectory)
  
  const posts = filenames
    .filter(filename => filename.endsWith('.md'))
    .map((filename, index) => {
      const filePath = path.join(postsDirectory, filename)
      const fileContents = fs.readFileSync(filePath, 'utf8')
      
      // Extract CREATED_DATE from AUTOMATE FIELD section
      // More flexible regex that handles different line endings
      const automateFieldMatch = fileContents.match(/###\s*AUTOMATE FIELD\s*([\s\S]*?)###\s*AUTOMATE FIELD END/)
      let createdDate = "1900-01-01";
      let title = filename.replace(/\.md$/, '')

      if (automateFieldMatch) {
        const automateSection = automateFieldMatch[1]
        const createdDateMatch = automateSection.match(/CREATED_DATE\s*=\s*(.+?)[\r\n]/)
        const topicMatch = automateSection.match(/Topic\s*=\s*(.+?)[\r\n]/)
        
        if (createdDateMatch) {
          createdDate = createdDateMatch[1].trim()
        }
        if (topicMatch) {
          title = topicMatch[1].trim()
        }
      }
      
      const slug = filename.replace(/\.md$/, '')
      
      return {
        id: String(index + 1),
        title: title || slug,
        slug: slug,
        created: createdDate,
      }
    })
    .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
  
  return NextResponse.json(posts)
}