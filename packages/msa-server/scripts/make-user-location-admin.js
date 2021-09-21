/* eslint-disable @typescript-eslint/no-var-requires */
const dotenv = require('dotenv');
const cli = require('cli');
const Sequelize = require('sequelize');

dotenv.config();
const db = {
    username: process.env.MYSQL_USER ?? 'server',
    password: process.env.MYSQL_PASSWORD ?? 'password',
    database: process.env.MYSQL_DATABASE ?? 'xrengine',
    host: process.env.MYSQL_HOST ?? '127.0.0.1',
    port: process.env.MYSQL_PORT ?? 3306,
    dialect: 'mysql',
    forceRefresh: process.env.FORCE_DB_REFRESH === 'true'
};

db.url = process.env.MYSQL_URL ??
    `mysql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`;

cli.enable('status');

const options = cli.parse({
    email: [false, 'Email of user to make admin', 'string'],
    locationId: [false, 'locationId to make user locatin-admin of', 'string']
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

        const IdentityProvider = sequelizeClient.define('identity_provider', {
            token: {type: Sequelize.DataTypes.STRING},
            password: {type: Sequelize.DataTypes.STRING},
            isVerified: {type: Sequelize.DataTypes.BOOLEAN},
            verifyToken: {type: Sequelize.DataTypes.STRING},
            verifyShortToken: {type: Sequelize.DataTypes.STRING},
            verifyExpires: {type: Sequelize.DataTypes.DATE},
            verifyChanges: {type: Sequelize.DataTypes.JSON},
            resetToken: {type: Sequelize.DataTypes.STRING},
            resetExpires: {type: Sequelize.DataTypes.DATE},
            userId: {type: Sequelize.DataTypes.STRING}
        });

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
            }
        });

        const Party = sequelizeClient.define('party', {
            id: {
                type: Sequelize.DataTypes.UUID,
                defaultValue: Sequelize.DataTypes.UUIDV1,
                allowNull: false,
                primaryKey: true
            },
            locationId: {
                type: Sequelize.DataTypes.UUID,
                allowNull: false
            }
        });

        const PartyUser = sequelizeClient.define('party_user', {
            id: {
                type: Sequelize.DataTypes.UUID,
                defaultValue: Sequelize.DataTypes.UUIDV1,
                allowNull: false,
                primaryKey: true
            },
            isOwner: {
                type: Sequelize.DataTypes.BOOLEAN
            },
            partyId: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false
            },
            userId: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false
            },
        });

        const LocationAdmin = sequelizeClient.define('location_admin', {
            id: {
                type: Sequelize.DataTypes.UUID,
                defaultValue: Sequelize.DataTypes.UUIDV1,
                allowNull: false,
                primaryKey: true
            },
            locationId: {
                type: Sequelize.DataTypes.UUID,
                defaultValue: Sequelize.DataTypes.UUIDV1,
                allowNull: false
            },
            userId: {
                type: Sequelize.DataTypes.UUID,
                defaultValue: Sequelize.DataTypes.UUIDV1,
                allowNull: false
            },
        });

        const identityProviderMatch = await IdentityProvider.findOne({
            where: {
                token: options.email,
                type: 'email'
            }
        });

        if (identityProviderMatch == null) {
            throw new Error('No matching user with email ' + options.email);
        }

        const userId = identityProviderMatch.userId;

        const userMatch = await User.findOne({
            where: {
                id: userId
            }
        });

        userMatch.userRole = 'location-admin';
        const locationAdmin = await LocationAdmin.findOne({
            where: {
                locationId: options.locationId,
                userId: userId
            }
        });
        if (locationAdmin == null) {
            await LocationAdmin.create({
                locationId: options.locationId,
                userId: userId
            });
        }
        await userMatch.save();

        cli.ok(`User with email ${options.email} and ID ${identityProviderMatch.userId} made an admin of location ${options.locationId}` );
        process.exit(0);
    }
    catch (err) {
        console.log(err);
        cli.fatal(err);
    }
});
