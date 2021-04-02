import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { ContentPack } from './content-pack.class';
import hooks from './content-pack.hooks';
import express from 'express';
import multer from 'multer';
import StorageProvider from '../../storage/storageprovider';
import dauria from "dauria";
import config from '../../config';
import {UploadPresigned} from "../upload-presigned/upload-presigned.class";
import uploadDocs from "../upload-presigned/upload-presigned.docs";
const multipartMiddleware = multer();

declare module '../../declarations' {
  interface ServiceTypes {
    'content-pack': ContentPack & ServiceAddons<any>;
  }
}

export default (app: Application): void => {
  const contentPack = new ContentPack({}, app);
  app.use('/content-pack', contentPack);

  const service = app.service('content-pack');

  (service as any).hooks(hooks);
};
