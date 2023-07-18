import { Plugin } from '@pexip/plugin-api';

import {
  authenticateWithPassword, authenticateWithRefreshToken
} from './collaboard-api/auth';

import {
  getProjects,
  createProject,
  deleteProject,
  createInvitationLink
} from './collaboard-api/project';
import { config } from '../config';

const collaboardIconV31 = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="rgb(199, 211, 6)" d="M 4.8857728,23.734387 C 2.6855846,23.331809 0.99671784,21.795622 0.42009705,19.672426 0.29585151,19.214938 0.28304709,19.086308 0.28205511,18.285702 0.2810653,17.486943 0.29362664,17.356479 0.41451386,16.910206 0.97417885,14.844076 2.5723522,13.317602 4.6377068,12.876481 c 0.6231265,-0.133087 1.5698678,-0.140311 2.1580473,-0.01646 1.2084983,0.254463 2.0953929,0.748162 2.9472071,1.640594 0.9906098,1.03785 1.4983568,2.313 1.4999298,3.766915 0.0017,1.557206 -0.542341,2.8515 -1.660891,3.951431 -0.520657,0.51199 -1.0088298,0.838214 -1.6964682,1.133677 -0.70562,0.303189 -1.1160803,0.387173 -1.9871677,0.406592 -0.4298844,0.0096 -0.8855501,-0.0016 -1.0125908,-0.02483 z m 12.6862832,-0.0082 C 16.78855,23.6659 16.106668,23.461672 15.378512,23.069098 14.549397,22.622095 13.828654,21.955522 13.504792,21.336205 13.096174,20.55481 12.971731,19.919939 12.906848,18.285701 12.843593,16.692444 12.717048,16.106547 12.201978,15.02217 11.396938,13.327318 9.9565473,12.056382 8.1594912,11.455255 7.4071294,11.203585 6.8398414,11.125775 5.7470845,11.124368 4.4329256,11.122672 3.6958263,10.997851 2.9517945,10.651001 1.7427889,10.087392 0.72283934,8.6659599 0.40369611,7.0998975 0.27690917,6.4777428 0.26467343,5.4281506 0.37728674,4.8345004 0.64023747,3.4483381 1.4355093,2.1603749 2.5358577,1.3386405 3.0729363,0.93755278 3.9292742,0.5200035 4.5620666,0.35066357 5.0227192,0.22738888 5.1470094,0.21571844 5.9992159,0.21571844 c 0.8424462,0 0.9795779,0.0125335 1.4144869,0.1292908 1.5627316,0.41953381 2.7177092,1.29597376 3.2818592,2.49039676 0.355603,0.7528862 0.409791,1.0797477 0.421279,2.5411584 0.0076,0.976612 0.03107,1.3945817 0.09727,1.7378784 0.191034,0.9906827 0.606356,1.9976331 1.151067,2.7907668 0.320133,0.4661354 1.142886,1.3079504 1.624707,1.6623524 0.68982,0.507395 1.593614,0.921053 2.519634,1.153211 0.445842,0.111773 0.667933,0.132206 1.818933,0.167318 1.385627,0.04227 1.818943,0.101529 2.43321,0.332737 1.175926,0.442618 1.866547,1.071065 2.434995,2.215787 0.412659,0.831001 0.554749,1.396698 0.588961,2.344823 0.03764,1.043015 -0.117396,1.855722 -0.513056,2.689492 -1.045588,2.203367 -3.221016,3.445599 -5.700505,3.255152 z M 17.338822,11.099874 C 15.422658,10.738402 13.805353,9.3572251 13.146558,7.5196817 12.798703,6.5494197 12.732447,5.3812676 12.97066,4.4184633 c 0.513001,-2.073415 1.990115,-3.57138668 4.063371,-4.12074827 0.424953,-0.11260152 0.591259,-0.12934229 1.29442,-0.13029078 0.708386,-9.562e-4 0.865721,0.0146568 1.289591,0.12797648 1.307894,0.34965845 2.357309,1.03827067 3.128699,2.05300787 0.345967,0.4551105 0.770572,1.3398729 0.932939,1.9439893 0.120025,0.4465714 0.135974,0.5994546 0.139424,1.336297 0.0043,0.9211028 -0.07218,1.3510009 -0.374909,2.1070239 -0.6364,1.5893309 -2.049122,2.8365542 -3.703806,3.2699042 -0.631568,0.165403 -1.784521,0.210653 -2.401567,0.09426 z"/></svg>';
const collaboardIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="rgb(255, 255, 255)" d="M 4.8857728,23.734387 C 2.6855846,23.331809 0.99671784,21.795622 0.42009705,19.672426 0.29585151,19.214938 0.28304709,19.086308 0.28205511,18.285702 0.2810653,17.486943 0.29362664,17.356479 0.41451386,16.910206 0.97417885,14.844076 2.5723522,13.317602 4.6377068,12.876481 c 0.6231265,-0.133087 1.5698678,-0.140311 2.1580473,-0.01646 1.2084983,0.254463 2.0953929,0.748162 2.9472071,1.640594 0.9906098,1.03785 1.4983568,2.313 1.4999298,3.766915 0.0017,1.557206 -0.542341,2.8515 -1.660891,3.951431 -0.520657,0.51199 -1.0088298,0.838214 -1.6964682,1.133677 -0.70562,0.303189 -1.1160803,0.387173 -1.9871677,0.406592 -0.4298844,0.0096 -0.8855501,-0.0016 -1.0125908,-0.02483 z m 12.6862832,-0.0082 C 16.78855,23.6659 16.106668,23.461672 15.378512,23.069098 14.549397,22.622095 13.828654,21.955522 13.504792,21.336205 13.096174,20.55481 12.971731,19.919939 12.906848,18.285701 12.843593,16.692444 12.717048,16.106547 12.201978,15.02217 11.396938,13.327318 9.9565473,12.056382 8.1594912,11.455255 7.4071294,11.203585 6.8398414,11.125775 5.7470845,11.124368 4.4329256,11.122672 3.6958263,10.997851 2.9517945,10.651001 1.7427889,10.087392 0.72283934,8.6659599 0.40369611,7.0998975 0.27690917,6.4777428 0.26467343,5.4281506 0.37728674,4.8345004 0.64023747,3.4483381 1.4355093,2.1603749 2.5358577,1.3386405 3.0729363,0.93755278 3.9292742,0.5200035 4.5620666,0.35066357 5.0227192,0.22738888 5.1470094,0.21571844 5.9992159,0.21571844 c 0.8424462,0 0.9795779,0.0125335 1.4144869,0.1292908 1.5627316,0.41953381 2.7177092,1.29597376 3.2818592,2.49039676 0.355603,0.7528862 0.409791,1.0797477 0.421279,2.5411584 0.0076,0.976612 0.03107,1.3945817 0.09727,1.7378784 0.191034,0.9906827 0.606356,1.9976331 1.151067,2.7907668 0.320133,0.4661354 1.142886,1.3079504 1.624707,1.6623524 0.68982,0.507395 1.593614,0.921053 2.519634,1.153211 0.445842,0.111773 0.667933,0.132206 1.818933,0.167318 1.385627,0.04227 1.818943,0.101529 2.43321,0.332737 1.175926,0.442618 1.866547,1.071065 2.434995,2.215787 0.412659,0.831001 0.554749,1.396698 0.588961,2.344823 0.03764,1.043015 -0.117396,1.855722 -0.513056,2.689492 -1.045588,2.203367 -3.221016,3.445599 -5.700505,3.255152 z M 17.338822,11.099874 C 15.422658,10.738402 13.805353,9.3572251 13.146558,7.5196817 12.798703,6.5494197 12.732447,5.3812676 12.97066,4.4184633 c 0.513001,-2.073415 1.990115,-3.57138668 4.063371,-4.12074827 0.424953,-0.11260152 0.591259,-0.12934229 1.29442,-0.13029078 0.708386,-9.562e-4 0.865721,0.0146568 1.289591,0.12797648 1.307894,0.34965845 2.357309,1.03827067 3.128699,2.05300787 0.345967,0.4551105 0.770572,1.3398729 0.932939,1.9439893 0.120025,0.4465714 0.135974,0.5994546 0.139424,1.336297 0.0043,0.9211028 -0.07218,1.3510009 -0.374909,2.1070239 -0.6364,1.5893309 -2.049122,2.8365542 -3.703806,3.2699042 -0.631568,0.165403 -1.784521,0.210653 -2.401567,0.09426 z"/></svg>';
const collaboardIconHover = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="rgb(17, 17, 17)" d="M 4.8857728,23.734387 C 2.6855846,23.331809 0.99671784,21.795622 0.42009705,19.672426 0.29585151,19.214938 0.28304709,19.086308 0.28205511,18.285702 0.2810653,17.486943 0.29362664,17.356479 0.41451386,16.910206 0.97417885,14.844076 2.5723522,13.317602 4.6377068,12.876481 c 0.6231265,-0.133087 1.5698678,-0.140311 2.1580473,-0.01646 1.2084983,0.254463 2.0953929,0.748162 2.9472071,1.640594 0.9906098,1.03785 1.4983568,2.313 1.4999298,3.766915 0.0017,1.557206 -0.542341,2.8515 -1.660891,3.951431 -0.520657,0.51199 -1.0088298,0.838214 -1.6964682,1.133677 -0.70562,0.303189 -1.1160803,0.387173 -1.9871677,0.406592 -0.4298844,0.0096 -0.8855501,-0.0016 -1.0125908,-0.02483 z m 12.6862832,-0.0082 C 16.78855,23.6659 16.106668,23.461672 15.378512,23.069098 14.549397,22.622095 13.828654,21.955522 13.504792,21.336205 13.096174,20.55481 12.971731,19.919939 12.906848,18.285701 12.843593,16.692444 12.717048,16.106547 12.201978,15.02217 11.396938,13.327318 9.9565473,12.056382 8.1594912,11.455255 7.4071294,11.203585 6.8398414,11.125775 5.7470845,11.124368 4.4329256,11.122672 3.6958263,10.997851 2.9517945,10.651001 1.7427889,10.087392 0.72283934,8.6659599 0.40369611,7.0998975 0.27690917,6.4777428 0.26467343,5.4281506 0.37728674,4.8345004 0.64023747,3.4483381 1.4355093,2.1603749 2.5358577,1.3386405 3.0729363,0.93755278 3.9292742,0.5200035 4.5620666,0.35066357 5.0227192,0.22738888 5.1470094,0.21571844 5.9992159,0.21571844 c 0.8424462,0 0.9795779,0.0125335 1.4144869,0.1292908 1.5627316,0.41953381 2.7177092,1.29597376 3.2818592,2.49039676 0.355603,0.7528862 0.409791,1.0797477 0.421279,2.5411584 0.0076,0.976612 0.03107,1.3945817 0.09727,1.7378784 0.191034,0.9906827 0.606356,1.9976331 1.151067,2.7907668 0.320133,0.4661354 1.142886,1.3079504 1.624707,1.6623524 0.68982,0.507395 1.593614,0.921053 2.519634,1.153211 0.445842,0.111773 0.667933,0.132206 1.818933,0.167318 1.385627,0.04227 1.818943,0.101529 2.43321,0.332737 1.175926,0.442618 1.866547,1.071065 2.434995,2.215787 0.412659,0.831001 0.554749,1.396698 0.588961,2.344823 0.03764,1.043015 -0.117396,1.855722 -0.513056,2.689492 -1.045588,2.203367 -3.221016,3.445599 -5.700505,3.255152 z M 17.338822,11.099874 C 15.422658,10.738402 13.805353,9.3572251 13.146558,7.5196817 12.798703,6.5494197 12.732447,5.3812676 12.97066,4.4184633 c 0.513001,-2.073415 1.990115,-3.57138668 4.063371,-4.12074827 0.424953,-0.11260152 0.591259,-0.12934229 1.29442,-0.13029078 0.708386,-9.562e-4 0.865721,0.0146568 1.289591,0.12797648 1.307894,0.34965845 2.357309,1.03827067 3.128699,2.05300787 0.345967,0.4551105 0.770572,1.3398729 0.932939,1.9439893 0.120025,0.4465714 0.135974,0.5994546 0.139424,1.336297 0.0043,0.9211028 -0.07218,1.3510009 -0.374909,2.1070239 -0.6364,1.5893309 -2.049122,2.8365542 -3.703806,3.2699042 -0.631568,0.165403 -1.784521,0.210653 -2.401567,0.09426 z"/></svg>';

let plugin: Plugin;
let authToken: string;

const initializeHost = async (plugin_rcv: Plugin) => {
  plugin = plugin_rcv;

  let custom: any = {
    main: collaboardIcon,
    hover: collaboardIconHover
  }
  if (config.infinityV31) {
    custom = collaboardIconV31
  }

  const button = await plugin.ui.addButton({
    position: 'toolbar',
    icon: {
      custom
    },
    tooltip: 'Open whiteboard',
    roles: ['chair']
  });

  button.onClick.add(async () => {
    showStartWhiteboardConfirmation();
  });
}

/**
 * Shows to the meeting to host with some information. The user can click on
 * start the whiteboard or cancel it.
 */
const showStartWhiteboardConfirmation = async() => {
  const primaryAction = 'Continue'
  const prompt = await plugin.ui.addPrompt({
    title: 'Create whiteboard',
    description: 'You will create a whiteboard and an invitation will be sent to ' +
      'the other participants. Do you want to continue?',
    prompt: {
      primaryAction,
      secondaryAction: 'Cancel'
    }
  })

  prompt.onInput.add(async (result: any) => {
    await prompt.remove()
    if (result === primaryAction) {
      // Get all the info from the localStorage
      const refreshToken = localStorage.getItem('collaboard:refreshToken') ?? '';
      if (refreshToken) {
        showConfirmCredentialsPrompt();
      } else {
        showAuthenticationForm();
      }
    }
  })
};

const showConfirmCredentialsPrompt = async () => {
  const primaryAction = 'Continue'
  const username = localStorage.getItem('collaboard:username') ?? ''
  const prompt = await plugin.ui.addPrompt({
    title: 'Confirm credentials',
    description: `You are logged with the user "${username}". Do you want to continue?`,
    prompt: {
      primaryAction,
      secondaryAction: 'Use other credentials'
    }
  })

  prompt.onInput.add(async (result: any) => {
    prompt.remove();
    if (result === primaryAction) {
      let response;
      try {
        const refreshToken = localStorage.getItem('collaboard:refreshToken') ?? '';
        response = await authenticateWithRefreshToken(refreshToken);
      } catch (error) {
        showCorsError();
      }
      if (response?.status === 200) {
        const jsonResponse = await response.json();
        authToken = jsonResponse.AuthorizationToken;
        const refreshToken = jsonResponse.RefreshToken;
        // Save all this info in the localStorage
        localStorage.setItem('collaboard:refreshToken', refreshToken);
        let link;
        try {
          const project = await generateProject();
          link = await createInvitationLink(authToken, project.ProjectId);
          await sendInvitationLink(link);
        } catch (error) {
          showError();
          return;
        }
        showSuccessPrompt(link); 
      } else {
        showWrongCredentials();
        return;
      }
    } else {
      showAuthenticationForm();
    }
  })
}

/***
 * Shows a form for introducing the username and password.
 */
const showAuthenticationForm = async () => {
  const form = await plugin.ui.addForm({
    title: 'Authenticate to Collaboard',
    description: 'Before starting the whiteboard you have to introduce your username and password:',
    form: {
      elements: {
        username: {
          name: 'Username',
          type: 'text'
        },
        password: {
          name: 'Password',
          type: 'password'
        }
      },
      submitBtnTitle: 'Sign in'
    }
  })

  form.onInput.add(async (formResult: any) => {
    form.remove();
    if (!formResult.username || !formResult.password) return;
    let response;
    try {
      response = await authenticateWithPassword(formResult.username, formResult.password);
    } catch (error) {
      showCorsError();
      return;
    }
    if (response?.status === 200) {
      const jsonResponse = await response.json();
      authToken = jsonResponse.AuthorizationToken;
      const refreshToken = jsonResponse.RefreshToken;
      const username = jsonResponse.User.UserName;
      // Save all this info in the localStorage
      localStorage.setItem('collaboard:refreshToken', refreshToken);
      localStorage.setItem('collaboard:username', username);
      let link;
      try {
        const project = await generateProject();
        link = await createInvitationLink(authToken, project.ProjectId);
        await sendInvitationLink(link);
      } catch (error) {
        showError();
        return;
      }
      showSuccessPrompt(link); 
    } else if (response?.status === 401) {
      showWrongCredentials();
      return;
    }
  })
}

/**
 * This form is displayed when you introduce wrong credentials. You can try again
 * or cancel the process.
 */
const showWrongCredentials = async () => {
  const primaryAction = 'Retry';
  const prompt = await plugin.ui.addPrompt({
    title: 'Wrong credentials',
    description: 'Wrong username and/or password. Do you want to try again?',
    prompt: {
      primaryAction,
      secondaryAction: 'Cancel'
    }
  })

  prompt.onInput.add(async (result: any) => {
    await prompt.remove();
    if (result === primaryAction) {
      showAuthenticationForm();
    }
  })
}

/**
 * Generate a new project with the "pexip-whiteboard" description. In case there
 * was another project with the same name, it deletes it and creates a new one.
 * @returns New project info in JSON format.
 */
const generateProject = async () => {
  const projectName = 'pexip-whiteboard';
  const projects = await getProjects(authToken);
  const projectToDelete = projects.find((project: any) => project.Project.Description === projectName);
  if (projectToDelete) await deleteProject(authToken, projectToDelete.Project.ProjectId);
  const project = await createProject(authToken, projectName);
  return project;
}

/**
 * Send the invitation to other participants.
 * @param link - Link that the other participants should open to accept the
 *   invitation.
 */
const sendInvitationLink = (link: string) => {
  plugin.conference.sendApplicationMessage({payload: {
    type: 'whiteboard-invitation',
    data: link
  }});
}

/**
 * Display to the host that the project were successfully created and, if we
 * click in the button, we will open a new tab with the whiteboard.
 * @param projectId - 
 */
const showSuccessPrompt = async (link: string) => {
  const primaryAction = 'Open';
  if (config.infinityV31) {
    const prompt = await plugin.ui.addPrompt({
      title: 'Whiteboard created',
      description: 'The whiteboard was created and shared with the other participants. ' +
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
      title: 'Whiteboard created',
      description: 'The whiteboard was created and shared with the other participants.',
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
    });
  }
}

/**
 * Show a message displaying to the user that we have a issue with CORS.
 */
const showCorsError = async () => {
  const primaryAction = 'Retry'
  const prompt = await plugin.ui.addPrompt({
    title: 'CORS error',
    description: 'Problem sending the credentials due a CORS problem.' +
      'This is a PoC and you need to install the Chrome extension "CORS Unblock". ' +
      'Do you want to try again?',
    prompt: {
      primaryAction,
      secondaryAction: 'Cancel'
    }
  })

  prompt.onInput.add(async (result: any) => {
    await prompt.remove()
    if (result === primaryAction) {
      showAuthenticationForm();
    }
  })
}

/**
 * Show a standard message message for an error when creating the whiteboard.
 */
const showError = async () => {
  const primaryAction = 'Retry';
  const prompt = await plugin.ui.addPrompt({
    title: 'Error found',
    description: 'There was an error while connecting to the whiteboard". ' +
      'Do you want to try again?',
    prompt: {
      primaryAction,
      secondaryAction: 'Cancel'
    }
  })

  prompt.onInput.add(async (result: any) => {
    await prompt.remove()
    if (result === primaryAction) {
      if (result === primaryAction) {
        // Get all the info from the localStorage
        const refreshToken = localStorage.getItem('collaboard:refreshToken') ?? '';
        if (refreshToken) {
          showConfirmCredentialsPrompt();
        } else {
          showAuthenticationForm();
        }
      }
    }
  })
}

export {
  initializeHost
}
