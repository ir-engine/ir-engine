import { HookContext, Hook } from '@feathersjs/feathers'

export default (): Hook =>
  async (context: HookContext): Promise<HookContext> => {
    if (!context.id || !context.params.query.userId) return context
    const { collection } = context.app.get('sequelizeClient').models

    const { ownedFileIds } = await collection.findOne({
      attributes: ['ownedFileIds'],
      where: {
        sid: context.id,
        userId: context.params.query.userId
      }
    })

    context.params.query = {
      ...context.params.query,
      resourceIds: JSON.parse(ownedFileIds)
    }
    return context
  }
