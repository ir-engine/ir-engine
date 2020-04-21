import dauria from 'dauria'
import { Hook, HookContext } from '@feathersjs/feathers'

export default (options = {}): Hook => {
  return async (context: HookContext) => {
    if (!context.data.uri && context.params.file) {
      const file = context.params.file
      const uri = dauria.getBase64DataURI(file.buffer, file.mimetype)
      context.data = { uri: uri }
    }

    return context
  }
}
