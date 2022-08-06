/* eslint-disable @typescript-eslint/no-var-requires */
const dotenv = require('dotenv-flow');
const cli = require('cli');
const Sequelize = require('sequelize');
import appRootPath from 'app-root-path'
const { scopeTypeSeed } = require('../packages/server-core/src/scope/scope-type/scope-type.seed')

dotenv.config({
    path: appRootPath.path,
    silent: true
})
const db = {
    username: process.env.MYSQL_USER ?? 'server',
    password: process.env.MYSQL_PASSWORD ?? 'password',
    database: process.env.MYSQL_DATABASE ?? 'xrengine',
    host: process.env.MYSQL_HOST ?? '127.0.0.1',
    port: process.env.MYSQL_PORT ?? 3306,
    dialect: 'mysql'
};

db.url = process.env.MYSQL_URL ??
    `mysql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`;

cli.enable('status');

const options = cli.parse({
    id: [false, 'ID of user to make admin', 'string']
});

cli.main(async () => {
    try {
        const sequelizeClient = new Sequelize({
            ...db,
            logging: true,
            define: {
                freezeTableName: true
            }
        });

        await sequelizeClient.sync();

        const User = sequelizeClient.define('user', {
            id: {
                type: Sequelize.DataTypes.UUID,
                defaultValue: Sequelize.DataTypes.UUIDV1,
                allowNull: false,
                primaryKey: true
            },
            name: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false
            },
            isGuest: {
                type: Sequelize.DataTypes.BOOLEAN,
                defaultValue: true,
                allowNull: false
            }
        });

        const Scope = sequelizeClient.define('scope', {
            id: {
                type: Sequelize.DataTypes.UUID,
                defaultValue: Sequelize.DataTypes.UUIDV1,
                allowNull: false,
                primaryKey: true
            },
            userId: {
                type: Sequelize.DataTypes.STRING,
                allowNull: true
            },
            type: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false
            }
        })

        const userMatch = await User.findOne({
            where: {
                id: options.id
            }
        });

        if (userMatch != null) {
            await userMatch.save();
            for(const { type } of scopeTypeSeed.templates) {
              try {
                const existingScope = await Scope.findOne({ where: { userId: options.id, type }})
                if (existingScope == null)
                  await Scope.create({ userId: options.id, type })
              } catch (e) { console.log(e) }
            }

            cli.ok(`User with id ${options.id} made an admin` );
        } else {
            cli.ok(`User with id ${options.id} does not exist`)
        }

        process.exit(0);
    }
    catch (err) {
        console.log(err);
        cli.fatal(err);
    }
});
