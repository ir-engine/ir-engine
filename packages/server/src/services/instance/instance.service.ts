import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Instance } from './instance.class';
import createModel from '../../models/instance.model';
import hooks from './instance.hooks';
import logger from "../../app/logger";

declare module '../../declarations' {
  interface ServiceTypes {
    'instance': Instance & ServiceAddons<any>;
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  };

  app.use('/instance', new Instance(options, app));

  const service = app.service('instance');

  service.hooks(hooks);

  service.publish('removed', async (data): Promise<any> => {
    try {
      const admins = await app.service('user').Model.findAll({
        where: {
          userRole: 'admin'
        }
      });
      const targetIds = admins.map(admin => admin.id);
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return await Promise.all(targetIds.map((userId: string) => {
        return app.channel(`userIds/${userId}`).send({
          instance: data
        });
      }));
    } catch (err) {
      logger.error(err);
      throw err;
    }
  });
};
