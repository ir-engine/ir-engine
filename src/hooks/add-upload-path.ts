import { Hook, HookContext } from '@feathersjs/feathers'
import * as path from 'path'
import getBasicMimetype from '../util/get-basic-mimetype'

export default (options = {}): Hook => {
  return async (context: HookContext) => {
    context.params.uploadPath = context.params.uploadPath ? context.params.uploadPath : path.join(context.params.uuid, getBasicMimetype(context.params.mime_type))
    return context
  }
}
