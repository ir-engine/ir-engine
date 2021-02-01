import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { GroupUserRank } from './group-user-rank.class';
import createModel from '../../models/group-user-rank.model';
import hooks from './group-user-rank.hooks';
import groupUserRankDocs from './group-user-rank.docs';

declare module '../../declarations' {
  interface ServiceTypes {
    'group-user-rank': GroupUserRank & ServiceAddons<any>;
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  };
  const event = new GroupUserRank(options, app);
  event.docs = groupUserRankDocs;
  app.use('/group-user-rank', event);

  const service = app.service('group-user-rank');

  service.hooks(hooks);
};
