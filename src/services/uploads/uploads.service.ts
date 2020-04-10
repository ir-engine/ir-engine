// Initializes the `uploads` service on path `/uploads`
import express from 'express'
import {ServiceAddons} from '@feathersjs/feathers';
//@ts-ignore
import blobService from 'feathers-blob';
import AWS from 'aws-sdk';
//@ts-ignore
import fs from 'fs-blob-store';
//@ts-ignore
import S3BlobStore from 's3-blob-store';
//@ts-ignore
import multer from 'multer';
import {Application} from '../../declarations';
import {Uploads} from './uploads.class';
import hooks from './uploads.hooks';

const providerName = process.env.STORAGE_PROVIDER;
const provider = getProvider();
const blobStorage = getBlobStorage();
const multipartMiddleware = multer();

// Add this service to the service type index
declare module '../../declarations' {
    interface ServiceTypes {
        'uploads': Uploads & ServiceAddons<any>;
    }
}

export default function (app: Application) {
    const options = {
        paginate: app.get('paginate')
    };

    // Initialize our service with any options it requires
    app.use('/uploads',
        multipartMiddleware.single('file'),
        function (req: express.Request, res: express.Response, next: express.NextFunction) {
            if (req && req.feathers) {
                req.feathers.file = (req as any).file;
            }
            next();
        },
        blobService({Model: blobStorage})
    );

    // Get our initialized service so that we can register hooks
    const service = app.service('uploads');

    service.hooks(hooks);
}


class LocalProvider {
    constructor() {

    }
}

function getProvider() {
    if (providerName === 'aws')
        return new AWS.S3({
            accessKeyId: process.env.ACCESSKEYID, // access key for your bucket
            secretAccessKey: process.env.SECRETACCESSKEY, // secret key for your bucket
        }); // for example 'us-west-2'
    else if (providerName === 'local')
        return {
            constructor() {}
        };
}

function getBlobStorage() {
    if (providerName === 'aws') {
        return new S3BlobStore({
            client: provider,
            bucket: process.env.S3_BLOB_BUCKET_NAME
        });
    }
    else if (providerName === 'local') {
        return fs('./uploads');
    }
}