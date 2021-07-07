import config from '@xrengine/server-core/src/appconfig';
import seeder from '@xrengine/server-core/src/util/seeder';
import {Sequelize} from 'sequelize';
import {setTimeout} from 'timers';
import {Application} from '../declarations';
import seederConfig from './seeder-config';

export default (app: Application): void => {
    try {
        const {forceRefresh} = config.db;
        const {performDryRun} = config.server;

        console.log("Starting app");

        const sequelize = new Sequelize({
            ...config.db,
            logging: forceRefresh ? console.log : false,
            define: {
                freezeTableName: true
            }
        });
        const oldSetup = app.setup;

        app.set('sequelizeClient', sequelize);

        // eslint-disable-next-line  @typescript-eslint/ban-ts-comment
        // @ts-ignore
        app.setup = function (...args: any): Application {
            let promiseResolve, promiseReject;
            app.isSetup = new Promise((resolve, reject) => {
                promiseResolve = resolve;
                promiseReject = reject;
            });
            sequelize
                .query('SET FOREIGN_KEY_CHECKS = 0')
                .then(() => {
                    // Sync to the database
                    for (const model of Object.keys(sequelize.models)) {
                        if (forceRefresh) console.log('creating associations for =>', sequelize.models[model]);
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
                                    promiseReject();
                                    throw err;
                                });

                            if (performDryRun) {
                                setTimeout(() => process.exit(0), 5000);
                            }
                        })
                        .catch((err) => {
                            console.log('Sequelize setup error');
                            console.log(err);
                            promiseReject();
                            throw err;
                        });
                })
                .then(sync => {
                    app.set('sequelizeSync', sync);
                    promiseResolve();
                    return sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
                })
                .catch((err) => {
                    console.log('Sequelize sync error');
                    console.log(err);
                    promiseReject();
                    throw err;
                });
            return oldSetup.apply(this, args);
        };
    } catch (err) {
        console.log('Error in app/sequelize.ts');
        console.log(err);
    }
};
