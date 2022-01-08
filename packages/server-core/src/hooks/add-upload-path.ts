import { Hook, HookContext } from '@feathersjs/feathers'
import * as path from 'path'

import getBasicMimetype from '../util/get-basic-mimetype'

export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    context.params.uploadPath = context.params.uploadPath
      ? context.params.uploadPath
      : path.join(context.params.uuid, getBasicMimetype(context.params.mimeType))
    return context
  }
}
