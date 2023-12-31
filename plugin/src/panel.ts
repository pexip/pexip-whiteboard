import type { Prompt } from '@pexip/plugin-api'
import { getPlugin } from './plugin'
import { closePopUp, getOpensPopUpParams, isSameDomain, openPopUp, popUpIdPanel } from './popUp'

let currentPanel: Prompt

const initializePanels = (): void => {
  if (isSameDomain()) {
    window.plugin.popupManager.add(popUpIdPanel, ctx => {
      if (ctx.action === 'Open') {
        currentPanel.remove().catch((e) => { console.error(e) })
        return true
      }
      return false
    })
  }
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
    'Do you want to open the whiteboard in a new window?'
  await currentPanel?.remove()
  currentPanel = await createWhiteboardLinkPanel(title, description, link)
}

const showInvitedPanel = async (link: string): Promise<void> => {
  const title = 'Whiteboard shared'
  const description = 'Another participant shared a whiteboard. ' +
    'Do you want to open the whiteboard in a new window?'
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
  const plugin = getPlugin()

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
  const plugin = getPlugin()

  const primaryAction = 'Open'

  closePopUp()

  console.log('Whiteboard Link')
  console.log(Object.assign(
    {
      title,
      description,
      prompt: {
        primaryAction,
        secondaryAction: 'Cancel'
      }
    },
    getOpensPopUpParams(popUpIdPanel)
  ))
  const panel = await plugin.ui.addPrompt(Object.assign(
    {
      title,
      description,
      prompt: {
        primaryAction,
        secondaryAction: 'Cancel'
      }
    },
    getOpensPopUpParams(popUpIdPanel)
  ))

  if (!isSameDomain()) {
    panel.onInput.add(async (result: any) => {
      await panel.remove()
      if (result === primaryAction) {
        closePopUp()
        openPopUp()
      }
    })
  } else {
    panel.onInput.add(async () => {
      await panel.remove()
    })
  }

  return panel
}

const createNotificationPanel = async (title: string, description: string): Promise<Prompt> => {
  const plugin = getPlugin()

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
