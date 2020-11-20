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


  try {
      console.log('Creating sequelize');
      const sequelize = new Sequelize({
          ...config.db,
          logging: forceRefresh ? console.log : false,
          define: {
              freezeTableName: true
          }
      });

      console.log('Created sequelize');
      console.log(sequelize);
      const oldSetup = app.setup;

      app.set('sequelizeClient', sequelize);

      console.log('app.setup:')
      app.setup = function (...args: any): Application {
          console.log('SequelizeSync:')
        // Sync to the database
        app.set('sequelizeSync',
          sequelize.sync({ force: forceRefresh })
            .then(() => {
                console.log('Sequelize synced, optionally running seeder');
              (app as any).configure(seeder({ services: seederConfig })).seed().catch(console.error).then(()=> {
                console.log("Seeded");
              });

              if (performDryRun) {
                setTimeout(() => process.exit(0), 5000);
              }
            })
            .catch(console.error)
        );
        return oldSetup.apply(this, args);
      };
  } catch(err) {
      console.log('Sequelize init failure');
      console.log(config.db);
      console.log(err)
  }
};
