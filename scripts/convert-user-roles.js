/* eslint-disable @typescript-eslint/no-var-requires */
const dotenv = require('dotenv-flow');
const cli = require('cli');
const Sequelize = require('sequelize');
import appRootPath from 'app-root-path'

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
            userRole: {
                type: Sequelize.DataTypes.STRING,
                allowNull: true
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

        const admins = await User.findAll({
            limit: 1000,
            where: {
                userRole: 'admin'
            }
        });

        await User.update({
            isGuest: true
        }, {
            where: {
                userRole: 'guest'
            }
        })
        await User.update({
            isGuest: false
        }, {
            where: {
                userRole: {
                    [Sequelize.Op.ne]: 'guest'
                }
            }
        })
        await Promise.all(admins.map(admin => new Promise(async resolve => {
            const existingAdminScope = await Scope.findOne({ where: { userId: admin.id, type: 'admin:admin'}})
            if (!existingAdminScope) {
                const scopeCreate = await Scope.create({
                    userId: admin.id,
                    type: 'admin:admin'
                })
            }
            resolve(null)
        })))

        cli.ok(`Existing users with userRole admin converted to users with admin scope` );

        process.exit(0);
    }
    catch (err) {
        console.log(err);
        cli.fatal(err);
    }
});
