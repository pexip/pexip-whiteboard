export type WebSocketMessageBody =
  | string
  | {
    link: string
    sendChatMessage?: boolean
  }
