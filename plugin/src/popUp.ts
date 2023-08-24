import type { PopupRequest } from '@pexip/plugin-api'

export const popUpIdPanel = 'whiteboard-pop-up-panel'
export const popUpIdButton = 'whiteboard-pop-up-button'
const popUpDimensions = 'width=800,height=600'

let whiteboardLink = ''
let windowPopUpDifferentDomain: Window | null

// export const initPopUp = (): void => {
//   if (isSameDomain()) {
//     window.plugin.popupManager.add(popUpId, ctx => {
//       console.log('pop-up-manager')
//       console.log(ctx)
//       if (ctx.action === 'Open') {
//         return true
//       }
//       return false
//     })
//   }
// }

export const setPopUpLink = (link: string): void => {
  whiteboardLink = link
}

export const getPopUpLink = (): string => {
  return whiteboardLink
}

export const getOpensPopUpParams = (popUpId: string): { opensPopup: PopupRequest } | null => {
  if (isSameDomain()) {
    return {
      opensPopup: {
        id: popUpId,
        openParams: [
          whiteboardLink,
          '',
          popUpDimensions
        ]
      }
    }
  } else {
    return null
  }
}

export const closePopUp = (): void => {
  if (isSameDomain()) {
    window.plugin.popupManager.get(popUpIdPanel)?.close()
    window.plugin.popupManager.get(popUpIdButton)?.close()
  } else {
    windowPopUpDifferentDomain?.close()
  }
}

export const openPopUp = (): void => {
  if (!isSameDomain()) {
    windowPopUpDifferentDomain = window.open(whiteboardLink, '', popUpDimensions)
  }
}

export const isSameDomain = (): boolean => {
  // Check if the plugin is served from the same domain as Web App 3
  let sameDomain: boolean = true
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    parent.document
  } catch (e) {
    sameDomain = false
  }
  return sameDomain
}
