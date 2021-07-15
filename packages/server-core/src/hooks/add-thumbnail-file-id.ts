import { HookContext } from '@feathersjs/feathers'

export default () => {
  return async (context: HookContext): Promise<HookContext> => {
    const fileIdentifier = context.params.body.fileIdentifier
    if (context.params.body.projectId && fileIdentifier) {
      const ownedUploadedFileId = await (context.app.service('collection') as any).Model.findOne({
        where: {
          sid: context.params.body.projectId
        }
      })
      console.log('Add thumbnail fied id:' + JSON.stringify(ownedUploadedFileId))
      context.params.previousFileId = ownedUploadedFileId[fileIdentifier]['file_id']
    }
    return context
  }
}
