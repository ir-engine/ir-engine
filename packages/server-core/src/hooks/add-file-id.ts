import { HookContext } from '@feathersjs/feathers'

export default () => {
  return async (context: HookContext): Promise<HookContext> => {
    const fileIdentifier = context.params.body.fileIdentifier
    if (context.params.body.projectId && fileIdentifier) {
      const { ownedFileIds } = await (context.app.service('collection') as any).Model.findOne({
        where: {
          sid: context.params.body.projectId
        }
      })
      context.params.previousFileId = JSON.parse(ownedFileIds)[fileIdentifier]
    }
    return context
  }
}
