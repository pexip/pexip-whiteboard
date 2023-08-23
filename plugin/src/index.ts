import { registerPlugin } from '@pexip/plugin-api'
import { initializeButton } from './button'
import { subscribeEvents } from './events'
import { setPlugin } from './plugin'

const plugin = await registerPlugin({
  id: 'whiteboard',
  version: 0
})

setPlugin(plugin)

subscribeEvents()
await initializeButton()
