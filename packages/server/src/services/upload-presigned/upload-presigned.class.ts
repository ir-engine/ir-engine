import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import S3Provider from '../../storage/s3.storage';

interface Data {}

interface ServiceOptions {}

/**
 * A class for Upload service 
 * 
 * @author Vyacheslav Solovjov
 */
export class UploadPresigned implements ServiceMethods<Data> {
  app: Application
  options: ServiceOptions
  docs: any
  s3 = new S3Provider();

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  async find (params?: Params): Promise<Data[] | Paginated<Data>> {
    return [];
  }

  async get (id: Id, params?: Params): Promise<Data> {
    let url = await this.s3.getSignedUrl(
      // this.getKeyForFilename(params['identity-provider'].userId + '/' + params.query.fileName),
      this.getKeyForFilename(params.query.fileName),
      3600,  // Expires After 1 hour
      [
        {"acl": "public-read"},
        ['content-length-range', 0, 15728640 ] // Max size 15 MB
      ]
    );
    console.log('url => ', url);
    // TODO: Review Security
    return url;
  }

  async create (data: Data, params?: Params): Promise<Data> {
    if (Array.isArray(data)) {
      return await Promise.all(data.map(current => this.create(current, params)));
    }

    const result = await this.app.service('static-resource').create({
      name: (data as any).name,
      description: (data as any).description,
      url: (data as any).url,
      mimeType: (data as any).mimeType
    });

    return result;
  }

  async update (id: NullableId, data: Data, params?: Params): Promise<Data> {
    console.debug('================================\n', id, data)
    return data;
  }

  async patch (id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data;
  }

  async remove (id: NullableId, params?: Params): Promise<Data> {
    let data = await this.s3.deleteResources(params.query.keys);
    console.log('result => ', data);
    return { id };
  }

  getKeyForFilename = (key: string) => {
    return `${process.env.STORAGE_S3_AVATAR_DIRECTORY}${process.env.STORAGE_S3_DEV_MODE ? '/' + process.env.STORAGE_S3_DEV_MODE : ''}/${key}`;
  }
}
