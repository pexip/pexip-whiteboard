import { Plugin } from '@pexip/plugin-api';
import { config } from '../config';

let plugin: Plugin;

const initializeGeneral = async (plugin_rcv: Plugin) => {
  plugin = plugin_rcv;
  plugin.events.applicationMessage.add((appMessage: any) => {
    if (appMessage.message.type === 'whiteboard-invitation') {
      showWhiteboardInvitation(appMessage.message.data as string);
    }
  })
}

const showWhiteboardInvitation = async (link: string) => {
  const primaryAction = 'Open';
  if (config.infinityV31) {
    const prompt = await plugin.ui.addPrompt({
      title: 'Whiteboard invitation',
      description: 'You have received a whiteboard invitation. ' +
        'Do you want to open the whiteboard in a new tab?',
      prompt: {
        primaryAction,
        secondaryAction: 'Cancel'
      }
    });

    prompt.onInput.add(async (result: any) => {
      await prompt.remove();
      if (result === primaryAction) {
        window.open(link, '', 'width=800,height=600');
      }
    });
  } else {
    await plugin.ui.showPrompt({
      title: 'Whiteboard invitation',
      description: 'You have received a whiteboard invitation.',
      prompt: {
        primaryAction,
        // secondaryAction: 'Cancel'
      },
      opensPopup: {
        id: 'open-collaboard-link',
        openParams: [
          link,
          '',
          'width=800,height=600'
        ]
      }
    })
  }
}

export {
  initializeGeneral
}