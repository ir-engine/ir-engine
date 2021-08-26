import { HookContext } from '@feathersjs/feathers'

export default () => {
  return async (context: HookContext): Promise<HookContext> => {
    const fileIdentifier = context.params.body.fileIdentifier
    console.log('FileIdentifier is:' + fileIdentifier)
    if (context.params.body.projectId && fileIdentifier) {
      const { ownedFileIds } = await (context.app.service('collection') as any).Model.findOne({
        where: {
          sid: context.params.body.projectId
        }
      })
      const parsedOwnedFileIds = JSON.parse(ownedFileIds)
      context.params.previousFileId = parsedOwnedFileIds != null ? parsedOwnedFileIds[fileIdentifier] : null
    }
    return context
  }
}
