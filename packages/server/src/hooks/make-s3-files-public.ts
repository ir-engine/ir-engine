import { Hook, HookContext } from '@feathersjs/feathers';

export default (options = {}): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    context.params.s3 = { ACL: 'public-read' };
    return context;
  };
};
