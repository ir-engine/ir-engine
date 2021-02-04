// Initializes the `invite` service on path `/invite`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Invite } from './invite.class';
import createModel from '../../models/invite.model';
import hooks from './invite.hooks';
import logger from '../../app/logger';
import inviteDocs from './invite.docs';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'invite': Invite & ServiceAddons<any>;
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  const event = new Invite(options, app);
  event.docs = inviteDocs;
  // Initialize our service with any options it requires
  app.use('/invite', event);

  // Get our initialized service so that we can register hooks
  const service = app.service('invite');

  service.hooks(hooks);

  service.publish('created', async (data): Promise<any> => {
    try {
      const targetIds = [data.userId];
      if (data.inviteeId) {
        targetIds.push(data.inviteeId);
      }
      else {
        const inviteeIdentityProviderResult = await app.service('identity-provider').find({
          query: {
            type: data.identityProviderType,
            token: data.token
          }
        });
        if ((inviteeIdentityProviderResult as any).total > 0) {
          targetIds.push((inviteeIdentityProviderResult as any).data[0].userId);
        }
      }
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return Promise.all(targetIds.map((userId: string) => {
        return app.channel(`userIds/${userId}`).send({
          invite: data
        });
      }));
    } catch (err) {
      logger.error(err);
      throw err;
    }
  });

  service.publish('removed', async (data): Promise<any> => {
    try {
      const targetIds = [data.userId];
      if (data.inviteeId) {
        targetIds.push(data.inviteeId);
      }
      else {
        const inviteeIdentityProviderResult = await app.service('identity-provider').find({
          query: {
            type: data.identityProviderType,
            token: data.token
          }
        });
        if ((inviteeIdentityProviderResult as any).total > 0) {
          targetIds.push((inviteeIdentityProviderResult as any).data[0].userId);
        }
      }
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return Promise.all(targetIds.map((userId: string) => {
        return app.channel(`userIds/${userId}`).send({
          invite: data
        });
      }));
    } catch (err) {
      logger.error(err);
      throw err;
    }
  });
};
