import { Sequelize } from 'sequelize';
import { Application } from '../declarations';
import seederConfig from '../app/seeder-config';
import seeder from 'feathers-seeder';
import config from '../config';
import { setTimeout } from 'timers';
import {SetupMethod} from "@feathersjs/feathers";

export default (app: Application): void => {
  const { forceRefresh } = config.db;
  const { performDryRun } = config.server;

  const sequelize = new Sequelize({
    ...config.db,
    logging: forceRefresh ? console.log : false,
    define: {
      freezeTableName: true
    }
  });
  const oldSetup = app.setup;

  app.set('sequelizeClient', sequelize);

  app.setup = function (...args: any): Application {
    // Sync to the database
    app.set('sequelizeSync',
      sequelize.sync({ force: forceRefresh })
        .then(() => {
          console.log('SEEDERCONFIG:');
          console.log(seederConfig);
          (app as any).configure(seeder({ services: seederConfig })).seed().catch(console.error);
          if (performDryRun) {
            setTimeout(() => process.exit(0), 5000);
          }
        })
        .catch(console.error)
    );
    return oldSetup.apply(this, args);
  };
};
