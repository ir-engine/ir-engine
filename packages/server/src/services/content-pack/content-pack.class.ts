import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import S3Provider from '../../storage/s3.storage';
import assembleScene from '../../util/assemble-scene';

interface Data {}

interface ServiceOptions {}
const s3 = new S3Provider();
const packRegex = /content-pack\/([a-zA-Z0-9_-]+)\/manifest.json/;

const getManifestKey = (packName: string) => `content-pack/${packName}/manifest.json`;
const getWorldFileKey = (packName: string, uuid: string) => `content-pack/${packName}/world/${uuid}.world`

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

    console.log('Content-pack create');
    console.log(data);
    const { scene, contentPack } = data as any;
    const packExists = await new Promise((resolve, reject) => {
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
      avatars: [],
      scenes: []
    };
    if (scene != null) {
      const worldFile = assembleScene(scene);
      console.log('Made worldFile:');
      console.log(worldFile);
      const worldFileKey = getWorldFileKey(contentPack, worldFile.root);
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
      console.log('UploadWorld result:');
      console.log(uploadWorld);
      body.scenes.push({
        name: worldFile.metadata.name,
        worldFile: worldFileKey
      })
    }

    const uploadFile = await new Promise((resolve, reject) => {
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
    console.log('Upload result:');
    console.log(uploadFile);
    return data;
  }

  async update (id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data;
  }

  async patch (id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data;
  }

  async remove (id: NullableId, params?: Params): Promise<Data> {
    return { id };
  }
}
