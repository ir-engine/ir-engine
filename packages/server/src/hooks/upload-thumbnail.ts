import { Hook, HookContext } from '@feathersjs/feathers';

export default (options = {}): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const { app } = context;
    if (context.params.thumbnail) {
      context.params.file = context.params.thumbnail;
      context.params.mimeType = context.params.file.mimetype;
      context.params.parentResourceId = context.result.id;
      context.data.metadata = context.data.metadata ? context.data.metadata : {};
      delete context.params.thumbnail;

      await app.services.upload.create(context.data, context.params);

      // await app.services['static-resource-type'].create({
      //   staticResource: result.id,
      //   type: 'thumbnail',
      //   resourceId: result.id
      // })

      // await app.services['static-resource-child'].create({
      //   staticResourceId: context.result.id,
      //   childStaticResourceId: result.id
      // })

      return context;
    } else {
      return context;
    }
  };
};
