import { Hook, HookContext } from '@feathersjs/feathers'
import dauria from 'dauria'
import _ from 'lodash'
import { extension } from 'mime-types'
import * as path from 'path'

export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    if (!context.data.uri && context.params.file) {
      const file = context.params.file
      const uri = dauria.getBase64DataURI(file.buffer, file.mimetype)
      context.data = { uri: uri }
    }

    if (!context.data.id && _.has(context, 'params.uploadPath')) {
      const uploadPath = _.get(context, 'params.uploadPath')
      const id = _.get(context, 'params.id')
      if (context.params.file.originalname === 'blob') {
        const fileExtenstion = String(extension(context.params.file.mimetype))
        context.data.id = uploadPath
          ? `${uploadPath as string}.${fileExtenstion}`
          : `${context.params.file.originalname as string}.${fileExtenstion}`
      } else {
        context.data.id =
          uploadPath && id
            ? path.join(uploadPath, id)
            : uploadPath
            ? path.join(uploadPath, context.params.file.originalname)
            : context.params.file.originalname
      }
    }

    return context
  }
}
