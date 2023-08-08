import type { Plugin, Prompt } from '@pexip/plugin-api'

const popUpId = 'open-whiteboard-link'

// Check if the plugin is served from the same domain as Web App 3
let sameDomain: boolean = true
try {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  parent.document
} catch (e) {
  sameDomain = false
}

let plugin: Plugin
let currentPanel: Prompt

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
  const primaryAction = 'Continue'
  if (currentPanel != null) {
    await currentPanel.remove()
  }
  currentPanel = await plugin.ui.addPrompt({
    title: 'Create whiteboard',
    description: 'You will create a whiteboard and send an invitation to all ' +
      'the other participants. Do you want to continue?',
    prompt: {
      primaryAction,
      secondaryAction: 'Cancel'
    }
  })
  currentPanel.onInput.add(async (result: any) => {
    await currentPanel.remove()
    if (result === primaryAction) {
      await callback()
    }
  })
}

const showCreatedPanel = async (title: string, description: string, link: string): Promise<void> => {
  const primaryAction = 'Open'
  if (currentPanel != null) {
    await currentPanel.remove()
  }
  if (sameDomain) {
    await plugin.ui.showPrompt({
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
          'width=800,height=600'
        ]
      }
    })
  } else {
    currentPanel = await plugin.ui.addPrompt({
      title,
      description,
      prompt: {
        primaryAction,
        secondaryAction: 'Cancel'
      }
    })

    currentPanel.onInput.add(async (result: any) => {
      await currentPanel.remove()
      if (result === primaryAction) {
        window.open(link, '', 'width=800,height=600')
      }
    })
  }
}

const showErrorPanel = async (error: string): Promise<void> => {
  currentPanel = await plugin.ui.addPrompt({
    title: 'Error',
    description: error,
    prompt: {
      primaryAction: 'Close'
    }
  })
  currentPanel.onInput.add(async (): Promise<void> => {
    await currentPanel.remove()
  })
}

export {
  initializePanels,
  showCreatePanel,
  showCreatedPanel,
  showErrorPanel
}
