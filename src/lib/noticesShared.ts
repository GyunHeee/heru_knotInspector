export type NoticeSummary = {
  id: number
  title: string
  contentPreview: string
  createdAt: string
  isRead: boolean
}

export type NoticeDetail = {
  id: number
  title: string
  content: string
  createdAt: string
  isRead: boolean
  readAt: string | null
}

export type NoticeListResponse = {
  notices: NoticeSummary[]
  unreadCount: number
  dbConfigured: boolean
}

export type NoticeDetailResponse = {
  notice: NoticeDetail | null
  unreadCount: number
  dbConfigured: boolean
}

export type NoticeCreateInput = {
  title: string
  content: string
}

export function createNoticePreview(content: string) {
  const normalized = content.replace(/\s+/g, " ").trim()

  if (normalized.length <= 72) {
    return normalized
  }

  return `${normalized.slice(0, 72)}...`
}
