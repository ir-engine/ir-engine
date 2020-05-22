import bent from 'bent'
import { Hook, HookContext } from '@feathersjs/feathers'

const fileRegex = /\.([a-zA-Z0-9]+)(?=\?|$)/
const getBuffer = bent('buffer')

export default (options = {}): Hook => {
  return async (context: HookContext) => {
    const { app, result, data, params } = context
    const metadata = result?.metadata || data?.metadata
    const id = result?.id || data?.id
    const extensionMatch = metadata.thumbnail_url.match(fileRegex)
    if (id != null && metadata.thumbnail_url && extensionMatch != null) {
      const extension = extensionMatch[1] as string
      const url = metadata.thumbnail_url
      const fileBuffer = await getBuffer(url)
      params.file = {
        fieldname: 'file',
        originalname: 'thumbnail.' + extension,
        encoding: '7bit',
        buffer: fileBuffer,
        size: fileBuffer.byteLength
      }

      params.mimeType = params.file.mimetype = 'image/' + extension
      params.subscriptionLevel = context.data.subscriptionLevel
      context.data.name = params.file.originalname
      context.data.metadata = context.data.metadata ? context.data.metadata : {}
      context.data.parentResourceId = params.parentResourceId
      params.uploadPath = params.uploadPath.replace('video', 'image')
      const uploadResult = await app.services.upload.create(context.data, params)
      const parent = await app.services['static-resource'].get(id)
      const parsedMetadata = JSON.parse(parent.metadata)
      parsedMetadata.thumbnail_url = uploadResult.url
      await app.services['static-resource'].patch(id, {
        metadata: parsedMetadata
      })

      params.thumbnailUrl = parsedMetadata.thumbnail_url

      return context
    } else {
      return context
    }
  }
}
