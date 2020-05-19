import bent from 'bent'
import { Hook, HookContext } from '@feathersjs/feathers'

const fileRegex = /\.([a-zA-Z0-9]+)(?=\?|$)/
const getBuffer = bent('buffer')

export default (options = {}): Hook => {
  return async (context: HookContext) => {
    const { app, result } = context
    const extensionMatch = result.metadata.thumbnail_url.match(fileRegex)
    if (result.id != null && result.metadata.thumbnail_url && extensionMatch != null) {
      const extension = extensionMatch[1] as string
      const url = result.metadata.thumbnail_url
      const fileBuffer = await getBuffer(url)
      context.params.file = {
        fieldname: 'file',
        originalname: 'thumbnail.' + extension,
        encoding: '7bit',
        buffer: fileBuffer,
        size: fileBuffer.byteLength
      }

      context.params.mime_type = context.params.file.mimetype = 'image/' + extension
      context.data.name = context.params.file.originalname
      context.data.metadata = context.data.metadata ? context.data.metadata : {}
      context.data.parentResourceId = context.params.parentResourceId
      context.params.uploadPath = context.params.uploadPath.replace('video', 'image')
      const uploadResult = await app.services.upload.create(context.data, context.params)
      const parent = await app.services['static-resource'].get(result.id)
      const metadata = JSON.parse(parent.metadata)
      metadata.thumbnail_url = uploadResult.url
      await app.services['static-resource'].patch(result.id, {
        metadata: metadata
      })

      context.params.thumbnailUrl = metadata.thumbnail_url

      return context
    } else {
      return context
    }
  }
}
