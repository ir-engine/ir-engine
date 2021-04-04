import { HookContext } from "@feathersjs/feathers";

export default (options = {}) => {
  return async (context: HookContext): Promise<HookContext> => {
    if (context.params.body.projectId) {
      const { thumbnailOwnedFileId } = await context.app
        .service('collection')
        .Model.findOne({
          where: {
            sid: context.params.body.projectId
          }
        });
      context.params.thumbnailOwnedFileId = thumbnailOwnedFileId;
    }
    return context;
  };
};
