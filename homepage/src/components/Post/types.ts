export interface NoteModel {
  id: string
  nid: string
  title: string
  text: string
  created: string
  modified?: string
  hide: boolean
  allowComment: boolean
  meta?: {
    cover?: string
  }
  images?: Image[]
  topic?: {
    name: string
    tags?: string[]
  }
  category?: {
    name: string
    caption?: string
    avatar?: string
  }
}

export interface Image {
  src: string
  alt?: string
  width?: number
  height?: number
}

export interface NoteWrappedPayload {
  data: NoteModel
}

export interface AutomateField {
  topic?: string
  id?: string
  createdDate?: string
  editedDate?: string
  tags?: string[]
  category?: string
  categoryCaption?: string
  categoryAvatar?: string
}

export interface TocItem {
  depth: number
  title: string
  anchorId: string
  index: number
}

export interface LanguageData {
  baseSlug: string
  currentLanguage: string
  availableLanguages: string[]
}

export interface PostProps {
  markdownContent?: string
  baseSlug?: string
  currentLanguage?: string
  availableLanguages?: string[]
}
