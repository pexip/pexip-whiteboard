import type { Plugin, Prompt } from '@pexip/plugin-api'

const popUpId = 'open-whiteboard-link'
const popUpDimensions = 'width=800,height=600'

let plugin: Plugin
let currentPanel: Prompt
let windowPopUpDifferentDomain: Window | null

const initializePanels = (pluginRcv: Plugin): void => {
  plugin = pluginRcv
  window.plugin.popupManager.add(popUpId, ctx => {
    if (ctx.action === 'Open') {
      return true
    }
    return false
  })
}

const showCreatePanel = async (callback: () => Promise<void>): Promise<void> => {
  const title = 'Create whiteboard'
  const description = 'You will create a whiteboard and send an invitation to all ' +
    'the other participants. Do you want to continue?'
  await currentPanel?.remove()
  currentPanel = await createCallbackPanel(title, description, callback)
}

const showCreatedSuccessfulPanel = async (link: string): Promise<void> => {
  const title = 'Whiteboard created'
  const description = 'You have created a whiteboard. ' +
    'Do you want to open the whiteboard in a new tab?'
  await currentPanel?.remove()
  currentPanel = await createWhiteboardLinkPanel(title, description, link)
}

const showInvitedPanel = async (link: string): Promise<void> => {
  const title = 'Whiteboard invitation'
  const description = 'You have received a whiteboard invitation. ' +
    'Do you want to open the whiteboard in a new tab?'
  await currentPanel?.remove()
  currentPanel = await createWhiteboardLinkPanel(title, description, link)
}

const showNoWhiteboardPanel = async (): Promise<void> => {
  const title = 'No whiteboard available'
  const description = 'The host hasn\'t created a whiteboard yet. This feature ' +
    'should be enabled by the host before starting using it.'
  await currentPanel?.remove()
  currentPanel = await createNotificationPanel(title, description)
}

const showErrorPanel = async (error: string): Promise<void> => {
  const title = 'Error'
  const description = error
  await currentPanel?.remove()
  currentPanel = await createNotificationPanel(title, description)
}

const createCallbackPanel = async (title: string, description: string, callback: () => Promise<void>): Promise<Prompt> => {
  const primaryAction = 'Continue'
  const panel = await plugin.ui.addPrompt({
    title,
    description,
    prompt: {
      primaryAction,
      secondaryAction: 'Cancel'
    }
  })
  panel.onInput.add(async (result: any) => {
    await panel.remove()
    if (result === primaryAction) {
      await callback()
    }
  })
  return panel
}

const createWhiteboardLinkPanel = async (title: string, description: string, link: string): Promise<Prompt> => {
  let panel: Prompt

  // Check if the plugin is served from the same domain as Web App 3
  let sameDomain: boolean = true
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    parent.document
  } catch (e) {
    sameDomain = false
  }

  if (sameDomain) {
    panel = await createWhiteboardLinkPanelSameDomain(title, description, link)
  } else {
    panel = await createWhiteboardLinkPanelDifferentDomain(title, description, link)
  }
  return panel
}

const createWhiteboardLinkPanelSameDomain = async (title: string, description: string, link: string): Promise<Prompt> => {
  const primaryAction = 'Open'

  window.plugin.popupManager.get(popUpId)?.close()

  const panel = await plugin.ui.addPrompt({
    title,
    description,
    prompt: {
      primaryAction,
      secondaryAction: 'Cancel'
    },
    opensPopup: {
      id: popUpId,
      openParams: [
        link,
        '',
        popUpDimensions
      ]
    }
  })

  panel.onInput.add(async (result: any) => {
    await panel.remove()
  })

  return panel
}

const createWhiteboardLinkPanelDifferentDomain = async (title: string, description: string, link: string): Promise<Prompt> => {
  const primaryAction = 'Open'

  windowPopUpDifferentDomain?.close()

  const panel = await plugin.ui.addPrompt({
    title,
    description,
    prompt: {
      primaryAction,
      secondaryAction: 'Cancel'
    }
  })

  panel.onInput.add(async (result: any) => {
    await panel.remove()
    if (result === primaryAction) {
      windowPopUpDifferentDomain = window.open(link, '', popUpDimensions)
    }
  })

  return panel
}

const createNotificationPanel = async (title: string, description: string): Promise<Prompt> => {
  const panel = await plugin.ui.addPrompt({
    title,
    description,
    prompt: {
      primaryAction: 'Close'
    }
  })
  panel.onInput.add(async (): Promise<void> => {
    await panel.remove()
  })
  return panel
}

export {
  initializePanels,
  showCreatePanel,
  showCreatedSuccessfulPanel,
  showInvitedPanel,
  showNoWhiteboardPanel,
  showErrorPanel
}
