// ═══ PROJECT TYPES ═══

export type Project = {
  title: string
  tags: string[]
  thumb?: string
  link?: string
  externalLink?: string
  comingSoon?: boolean
  images?: string[]
  slides: string[]
  desc?: string | string[]
}

// ═══ BOOK TYPES ═══

export type BookNote = {
  note: string
}

export type Book = {
  title: string
  author: string
  cover: string
  progress: number
  subtitle?: string
  fav?: boolean
  notes: BookNote[]
}

export type BookCategory = 'all' | 'excellent' | 'great' | 'reading'

// ═══ MYMIND TYPES ═══

type MymindBase = {
  title: string
  category: string
  date: string
  tags?: string[]
  tldr?: string
  url?: string
  source?: string
}

export type MymindImageCard = MymindBase & {
  type: 'image'
  img?: string
  height?: number
  caption: string
  color?: string
}

export type MymindNoteCard = MymindBase & {
  type: 'note'
  text: string
  author?: string
}

export type MymindLinkCard = MymindBase & {
  type: 'link'
  icon: string
  linkTitle: string
  linkDesc: string
}

export type MymindCard = MymindImageCard | MymindNoteCard | MymindLinkCard

// ═══ NOTE TYPES ═══

export type RichBlock =
  | { type: 'text'; html: string }
  | { type: 'code'; html: string }
  | { type: 'image'; src: string; caption: string }
  | { type: 'callout'; html: string }
  | { type: 'demo'; id: string }

export type Note = {
  slug: string
  title: string
  date: string
  sortDate: number
  tags: string[]
  preview: string
  rich?: boolean
  body: string | RichBlock[]
}

export type GlossaryEntry = {
  title: string
  desc: string
}
