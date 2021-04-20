import config from '@xr3ngine/server-core/src/appconfig';
import seeder from 'feathers-seeder';
import { Sequelize } from 'sequelize';
import { setTimeout } from 'timers';
import { Application } from '../declarations';
import seederConfig from './seeder-config';

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
            for (const model of Object.keys(sequelize.models)) {
              if (typeof ((sequelize.models[model] as any).associate) === 'function') {
                (sequelize.models[model] as any).associate(sequelize.models);
              }
            }
              return sequelize
                  .sync({force: forceRefresh})
                  .then(() => {
                      return (app as any)
                          .configure(seeder({services: seederConfig}))
                          .seed()
                          .then(() => {
                              console.log('Server Ready');
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
