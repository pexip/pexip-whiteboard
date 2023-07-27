import { Plugin, Prompt } from '@pexip/plugin-api';

const popUpId = 'open-whiteboard-link';

// Check if the plugin is served from the same domain as Web App 3
let sameDomain: boolean = true;
try{
  parent.document;
} catch(e) {
  sameDomain = false;
}

let plugin: Plugin;
let currentPanel: Prompt;

const initializePanels = (plugin_rcv: Plugin) => {
  plugin = plugin_rcv;
  window.plugin.popupManager.add(popUpId, ctx => {
    if (ctx.action === 'Open') {
        return true;
    }
    return false;
  });
}

const showCreatePanel = async (callback: () => void) => {
  const primaryAction = 'Continue';
  if (currentPanel != null) {
    currentPanel.remove();
  }
  currentPanel = await plugin.ui.addPrompt({
    title: 'Create whiteboard',
    description: 'You will create a whiteboard and send an invitation to all ' +
      'the other participants. Do you want to continue?',
    prompt: {
      primaryAction,
      secondaryAction: 'Cancel'
    }
  });
  currentPanel.onInput.add(async (result: any) => {
    await currentPanel.remove()
    if (result === primaryAction) {
      callback();
    }
  })
};

const showCreatedPanel = async (title: string, description: string, link: string): Promise<void> => {
  const primaryAction = 'Open';
  if (currentPanel != null) {
    currentPanel.remove();
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
    });
  } else {
    currentPanel = await plugin.ui.addPrompt({
      title,
      description,
      prompt: {
        primaryAction,
        secondaryAction: 'Cancel'
      }
    });

    currentPanel.onInput.add(async (result: any) => {
      await currentPanel.remove();
      if (result === primaryAction) {
        window.open(link, '', 'width=800,height=600');
      }
    });
  }
}

const showErrorPanel = async (error: string): Promise<void> => {
  currentPanel = await plugin.ui.addPrompt({
    title: 'Error',
    description: error,
    prompt: {
      primaryAction: 'Close'
    }
  });
  currentPanel.onInput.add(() => currentPanel.remove());
}

export {
  initializePanels,
  showCreatePanel,
  showCreatedPanel,
  showErrorPanel
}