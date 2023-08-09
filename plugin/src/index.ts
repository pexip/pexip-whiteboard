import { registerPlugin } from '@pexip/plugin-api'
import { initializeButton } from './button'
import { initializePanels } from './panel'
import { subscribeEvents } from './events'

const plugin = await registerPlugin({
  id: 'whiteboard',
  version: 0
})

subscribeEvents(plugin)
await initializeButton(plugin)
initializePanels(plugin)
