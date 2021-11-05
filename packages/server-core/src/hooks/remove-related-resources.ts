import { Hook, HookContext } from '@feathersjs/feathers'

/**
 * @author Abhishek Pathak
 */
export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const { params } = context
    if (params.query && params.query.resourceIds) {
      Object.values(params.query.resourceIds).forEach(async (resourceId: string) => {
        //await removeFile(context, resourceId)
      })
      return context
    }
  }
}
