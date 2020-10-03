import { HookContext, Hook } from '@feathersjs/feathers';

export default (options = {}): Hook => async (context: HookContext): Promise<HookContext> => {
  if (!context.id || !context.params.query.userId) return context;
  const { collection } = context.app.get('sequelizeClient').models;

  const project = await collection.findOne({
    attributes: ['thumbnailOwnedFileId'],
    where: {
      sid: context.id,
      userId: context.params.query.userId
    }
  });

  context.params.query = {
    ...context.params.query,
    projectId: context.id
  };
  context.id = project.thumbnailOwnedFileId;

  return context;
};
