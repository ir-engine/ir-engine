import { Sequelize } from 'sequelize';
import { Application } from '../declarations';
import seederConfig from '../app/seeder-config';
import seeder from 'feathers-seeder';
import config from '../config';
import { setTimeout } from 'timers';
import {SetupMethod} from "@feathersjs/feathers";

export default (app: Application): void => {
  try {
    const {forceRefresh} = config.db;
    const {performDryRun} = config.server;

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
      sequelize
          .query('SET FOREIGN_KEY_CHECKS = 0')
          .then(() => {
            // Sync to the database
              return sequelize
                  .sync({force: forceRefresh})
                  .then(() => {
                      return (app as any)
                          .configure(seeder({services: seederConfig}))
                          .seed()
                          .then(() => {
                              console.log('Seeded');
                              return Promise.resolve();
                          })
                          .catch((err) => {
                              console.log('Feathers seeding error');
                              console.log(err);
                              throw err;
                          });

                      if (performDryRun) {
                          setTimeout(() => process.exit(0), 5000);
                      }
                  })
                  .catch((err) => {
                      console.log('Sequelize setup error');
                      console.log(err);
                      throw err;
                  });
          })
          .then(sync => {
            app.set('sequelizeSync', sync);
            return sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
          })
          .catch((err) => {
            console.log('Sequelize sync error');
            console.log(err);
            throw err;
          });
      return oldSetup.apply(this, args);
    };
  } catch(err) {
    console.log('Error in app/sequelize.ts');
    console.log(err);
  }
};
