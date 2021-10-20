/* eslint-disable @typescript-eslint/no-var-requires */
const dotenv = require('dotenv');
const fs = require('fs');
const Sequelize = require('sequelize');
const aws = require('aws-sdk');
const { nanoid } = require('nanoid');

// TODO: check for existing avatar on S3

dotenv.config({ path: process.cwd() + '/../../.env.local' });
const forceS3Upload = process.argv.includes('--force-s3-upload');

const s3 = new aws.S3({
    accessKeyId: process.env.STORAGE_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.STORAGE_AWS_ACCESS_KEY_SECRET,
    region: process.env.STORAGE_S3_REGION
});

const db = {
    username: process.env.MYSQL_USER || 'server',
    password: process.env.MYSQL_PASSWORD || 'password',
    database: process.env.MYSQL_DATABASE || 'creator',
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: process.env.MYSQL_PORT || 3306,
    dialect: 'mysql',
    url: process.env.MYSQL_URL ||
    `mysql://${this.username}:${this.password}@${this.host}:${this.port}/${this.database}`
};

const sequelizeClient = new Sequelize({
    ...db,
    logging: true,
    define: {
        freezeTableName: true
    },
});

const staticResource = sequelizeClient.define('static_resource', {
    id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
    },
    sid: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true
    },
    url: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
    key: Sequelize.DataTypes.STRING,
    staticResourceType: Sequelize.DataTypes.STRING,
    userId: Sequelize.DataTypes.CHAR,
    createdAt: Sequelize.DataTypes.DATE,
    updatedAt: Sequelize.DataTypes.DATE,
});

// match case of the name of the avatar and the name of corresponding file.
// also update seed file of static resource model to match changes.
const AVATAR_LIST = [
    // 'Allison',
    // 'Rose',
    // 'Andy',
    // 'Erik',
    // 'Geoff',
    // 'Jace',
    // 'Karthik'
    'Razer1',
    'Razer2',
    'Razer3',
    'Razer4',
    'Razer5',
    'Razer6'
];
const MODEL_PATH = process.cwd() + '/../client/public/models/avatars/';
const THUMBNAIL_PATH = process.cwd() + '/../client/public/static/';
const MODEL_EXTENSION = '.glb';
const THUMBNAIL_EXTENSION = '.jpg';
const BUCKET = process.env.STORAGE_S3_STATIC_RESOURCE_BUCKET;
const AVATAR_FOLDER = process.env.STORAGE_S3_AVATAR_DIRECTORY;
const AVATAR_RESOURCE_TYPE = 'avatar';
const THUMBNAIL_RESOURCE_TYPE = 'user-thumbnail';

const uploadFile = (Key, Body) => {
    return new Promise((resolve) => {
        s3.headObject({
            Bucket: BUCKET,
            Key: Key,
        }, (err, data) => {
            if (forceS3Upload || err && err.code === 'NotFound') {
                s3.putObject({
                    Body,
                    Bucket: BUCKET,
                    Key,
                    ACL: 'public-read',
                }, (err, data) => {
                    resolve(data);
                });
            } else {
                console.log('Object Already Exist hence Skipping => ', Key);
                resolve(data);
            }
        });
    });
};

const saveToDB = async (name, extension, staticResourceType) => {
    return staticResource.create({
        sid: nanoid(8),
        name,
        url: 'https://s3.amazonaws.com/' + BUCKET + '/' + AVATAR_FOLDER + '/' + name + extension,
        key: AVATAR_FOLDER + '/' + name + extension,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        staticResourceType,
    });
};

const processFile = async (fileName, extension, dirPath, staticResourceType) => {
    const location = dirPath + fileName + extension;
    console.log('File Location => ', location);
    const file = fs.readFileSync(location);
    const result = await uploadFile(AVATAR_FOLDER + '/' + fileName + extension, file);
    console.log('Uploading status => ', result);

    console.log('Saving to DB');
    await saveToDB(fileName, extension, staticResourceType);
    console.log('Saved To DB');
};

new Promise(async (resolve, reject) => {
    try {
        console.log('Removing old DB entries.');
        await staticResource.destroy({
            where: {
                userId: null,
                staticResourceType: {
                    [Sequelize.Op.in] : [AVATAR_RESOURCE_TYPE, THUMBNAIL_RESOURCE_TYPE],
                },
            }
        });

        for (const avatar of AVATAR_LIST) {
            console.log('Uploading Avatar Model =>', avatar);
            await processFile(avatar, MODEL_EXTENSION, MODEL_PATH, AVATAR_RESOURCE_TYPE);

            console.log('Uploading Avatar Thumbnail =>', avatar);
            await processFile(avatar, THUMBNAIL_EXTENSION, THUMBNAIL_PATH, THUMBNAIL_RESOURCE_TYPE);
        }
        resolve(true);
    } catch (err) {
        reject(err);
    }
}).then(() => {
    console.log('Uploading Completed.');
}).catch(err => {
    console.log('Error Occured => ', err);
});
