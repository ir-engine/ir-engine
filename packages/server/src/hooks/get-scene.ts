import { Hook, HookContext } from '@feathersjs/feathers';

export default (options = {}): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    // const scene = app.service('collection').get(

    return context;
  };
};
