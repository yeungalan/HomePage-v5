import { AutomateField } from '../types'

/**
 * Parse markdown with automate fields
 * Extracts metadata from AUTOMATE FIELD section in markdown files
 */
export const parseMarkdownWithMetadata = (
  content: string
): { metadata: AutomateField; markdown: string; title: string } => {
  // More flexible regex that handles different line endings and spacing
  const automateFieldRegex = /###\s*AUTOMATE\s+FIELD[\s\S]*?###\s*AUTOMATE\s+FIELD\s+END/i
  const match = content.match(automateFieldRegex)

  const metadata: AutomateField = {}
  let markdown = content

  if (match) {
    const metadataBlock = match[0]
    // Extract just the content between the markers
    const innerContent = metadataBlock
      .replace(/###\s*AUTOMATE\s+FIELD/gi, '')
      .replace(/###\s*AUTOMATE\s+FIELD\s+END/gi, '')
    const lines = innerContent.split(/\r?\n/).filter(line => line.trim())

    lines.forEach(line => {
      const separator = line.indexOf('=')
      if (separator === -1) return
      const key = line.slice(0, separator).trim()
      const value = line.slice(separator + 1).trim()
      if (key && value) {
        switch (key) {
          case 'Topic':
            metadata.topic = value
            break
          case 'ID':
            metadata.id = value
            break
          case 'CREATED_DATE':
            metadata.createdDate = value
            break
          case 'EDITED_DATE':
            metadata.editedDate = value
            break
          case 'TAG':
            metadata.tags = value.split(',').map(t => t.trim())
            break
          case 'CATEGORY':
            metadata.category = value
            break
          case 'CATEGORY_CAPTION':
            metadata.categoryCaption = value
            break
          case 'CATEGORY_AVATAR':
            metadata.categoryAvatar = value
            break
          case 'AI_SUMMARY':
            metadata.aiSummary = value
            break
        }
      }
    })

    // Remove the entire metadata block from the markdown (including surrounding whitespace)
    markdown = content.replace(automateFieldRegex, '').trim()
  }

  // Extract title from first h1 heading
  const titleMatch = markdown.match(/^#\s+(.+)$/m)
  const title = titleMatch ? titleMatch[1] : 'Untitled'

  return { metadata, markdown, title }
}
