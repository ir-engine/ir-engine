import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import S3Provider from '../../storage/s3.storage';
import { assembleScene, populateScene } from './content-pack-helper';
import config from "../../config";
import axios from 'axios';

interface Data {}

interface ServiceOptions {}
const s3 = new S3Provider();
const packRegex = /content-pack\/([a-zA-Z0-9_-]+)\/manifest.json/;

const getManifestKey = (packName: string) => `content-pack/${packName}/manifest.json`;
const getWorldFileKey = (packName: string, uuid: string) => `content-pack/${packName}/world/${uuid}.world`
const getWorldFileUrl = (packName: string, uuid: string) => `https://${config.aws.cloudfront.domain}/content-pack/${packName}/world/${uuid}.world`;

/**
 * A class for Upload Media service 
 * 
 * @author Vyacheslav Solovjov
 */
export class ContentPack implements ServiceMethods<Data> {
  app: Application
  options: ServiceOptions

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  async find (params?: Params): Promise<Data[] | Paginated<Data>> {
    console.log('content-pack.class -find- called');
    const result = await new Promise((resolve, reject) => {
      s3.provider.listObjectsV2({
        Bucket: s3.bucket,
        Prefix: 'content-pack'
      }, (err, data) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
    return (result as any).Contents.filter(result => packRegex.exec(result.Key) != null).map(match => packRegex.exec(match.Key)[1]);
  }

  async get (id: Id, params?: Params): Promise<Data> {
    return {};
  }

  async create (data: Data, params?: Params): Promise<Data> {
    if (Array.isArray(data)) {
      return await Promise.all(data.map(current => this.create(current, params)));
    }

    let uploadPromises = [];
    const { scene, contentPack } = data as any;
    await new Promise((resolve, reject) => {
      s3.provider.getObjectAcl({
        Bucket: s3.bucket,
        Key: getManifestKey(contentPack)
      }, (err, data) => {
        if (err) {
          if (err.code === 'NoSuchKey') resolve(null);
          else {
            console.error(err);
            reject(err);
          }
        } else {
          reject(new Error('Pack already exists'));
        }
      });
    });
    const body = {
      version: 1,
      avatars: [],
      scenes: []
    };
    if (scene != null) {
      const assembleResponse = assembleScene(scene, contentPack);
      const worldFile = assembleResponse.worldFile;
      uploadPromises = assembleResponse.uploadPromises;
      if (typeof worldFile.metadata === 'string') worldFile.metadata = JSON.parse(worldFile.metadata);
      const worldFileKey = getWorldFileKey(contentPack, worldFile.metadata.name);
      await new Promise((resolve, reject) => {
        s3.provider.putObject({
          ACL: "public-read",
          Body: Buffer.from(JSON.stringify(worldFile)),
          Bucket: s3.bucket,
          ContentType: "application/json",
          Key: worldFileKey
        }, (err, data) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
      body.scenes.push({
        name: worldFile.metadata.name,
        worldFile: getWorldFileUrl(contentPack, worldFile.metadata.name)
      });
    }

    await new Promise((resolve, reject) => {
      s3.provider.putObject({
        ACL: "public-read",
        Body: Buffer.from(JSON.stringify(body)),
        Bucket: s3.bucket,
        ContentType: "application/json",
        Key: getManifestKey(contentPack)
      }, (err, data) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
    await Promise.all(uploadPromises);
    return data;
  }

  async update (id: NullableId, data: Data, params?: Params): Promise<Data> {
    const manifestUrl = data.manifestUrl;
    const manifestResult = await axios.get(manifestUrl);
    console.log(manifestResult);
    const { avatars, scenes } = manifestResult.data;
    for (let index in scenes) {
      const scene = scenes[index];
      console.log('scene:', scene)
      const sceneResult = await axios.get(scene.worldFile);
      console.log(sceneResult);
      await populateScene(sceneResult.data, this.app);
    }
    return data;
  }

  async patch (id: NullableId, data: Data, params?: Params): Promise<Data> {
    let uploadPromises = [];
    const { scene, contentPack } = data as any;
    const pack = await new Promise((resolve, reject) => {
      s3.provider.getObject({
        Bucket: s3.bucket,
        Key: getManifestKey(contentPack)
      }, (err, data) => {
        if (err) {
          if (err.code === 'NoSuchKey') reject('Pack does not exist');
          else {
            reject(err);
          }
        } else {
          resolve(data);
        }
      });
    });
    const body = JSON.parse((pack as any).Body.toString());
    if (scene != null) {
      const assembleResponse = assembleScene(scene, contentPack);
      const worldFile = assembleResponse.worldFile;
      uploadPromises = assembleResponse.uploadPromises;
      if (typeof worldFile.metadata === 'string') worldFile.metadata = JSON.parse(worldFile.metadata);
      const worldFileKey = getWorldFileKey(contentPack, worldFile.metadata.name);
      const uploadWorld = await new Promise((resolve, reject) => {
        s3.provider.putObject({
          ACL: "public-read",
          Body: Buffer.from(JSON.stringify(worldFile)),
          Bucket: s3.bucket,
          ContentType: "application/json",
          Key: worldFileKey
        }, (err, data) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
      const existingSceneIndex = body.scenes.findIndex(existingScene => existingScene.name === worldFile.metadata.name);
      if (existingSceneIndex > -1 ) body.scenes.splice(existingSceneIndex, 1);
      body.scenes.push({
        name: worldFile.metadata.name,
        worldFile: getWorldFileUrl(contentPack, worldFile.metadata.name)
      });
    }

    if (body.version) body.version++;
    else body.version = 1;
    const uploadManifest = await new Promise((resolve, reject) => {
      s3.provider.putObject({
        ACL: "public-read",
        Body: Buffer.from(JSON.stringify(body)),
        Bucket: s3.bucket,
        ContentType: "application/json",
        Key: getManifestKey(contentPack)
      }, (err, data) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
    console.log('Upload manifest result:');
    console.log(uploadManifest);
    await Promise.all(uploadPromises);
    return data;
  }

  async remove (id: NullableId, params?: Params): Promise<Data> {
    return { id };
  }
}
