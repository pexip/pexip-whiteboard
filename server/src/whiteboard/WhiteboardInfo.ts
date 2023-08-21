import type { Provider } from './providers/Provider'

export interface WhiteboardInfo {
  conference: string
  whiteboardId: string
  whiteboardLink: string
  provider: Provider
}
