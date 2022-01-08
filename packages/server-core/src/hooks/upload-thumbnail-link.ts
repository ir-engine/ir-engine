import { Hook, HookContext } from '@feathersjs/feathers'
import bent from 'bent'

import config from '../appconfig'

const fileRegex = /\.([a-zA-Z0-9]+)(?=\?|$)/
const getBuffer = bent('buffer')

export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const { app, result, data, params } = context
    const metadata = result?.metadata || data?.metadata
    const id = result?.id || data?.id
    const extensionMatch = metadata.thumbnailUrl.match(fileRegex)
    if (id && metadata.thumbnailUrl && extensionMatch) {
      const extension = extensionMatch[1] as string
      const url = metadata.thumbnailUrl
      const fileBuffer = await getBuffer(url)
      params.file = {
        fieldname: 'file',
        originalname: 'thumbnail.' + extension,
        encoding: '7bit',
        buffer: fileBuffer,
        size: fileBuffer.byteLength
      }

      params.mimeType = params.file.mimetype = 'image/' + extension
      context.data.name = params.file.originalname
      context.data.metadata = context.data.metadata ? context.data.metadata : {}
      context.data.parentResourceId = params.parentResourceId
      params.uploadPath = params.uploadPath.replace('video', 'image')
      const uploadResult = await app.services.upload.create(context.data, params)
      const parent = await app.services['static-resource'].get(id)
      const parsedMetadata = JSON.parse(parent.metadata)
      parsedMetadata.thumbnailUrl = uploadResult.url.replace(
        's3.amazonaws.com/' + config.aws.s3.staticResourceBucket,
        config.aws.cloudfront.domain
      )
      await app.services['static-resource'].patch(id, {
        metadata: parsedMetadata
      })

      params.thumbnailUrl = parsedMetadata.thumbnailUrl

      return context
    } else {
      return context
    }
  }
}
