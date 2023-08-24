import { registerPlugin } from '@pexip/plugin-api'
import { initializeButton } from './button'
import { subscribeEvents } from './events'
import { setPlugin } from './plugin'
import { initializePanels } from './panel'

const plugin = await registerPlugin({
  id: 'whiteboard',
  version: 0
})

setPlugin(plugin)

initializePanels()
subscribeEvents()
await initializeButton()
