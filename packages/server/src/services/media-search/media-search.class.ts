import SketchFabMedia from './sketch-fab.class';
import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers';
import { Application } from '../../declarations';

interface Data {}

interface ServiceOptions {
  paginate: boolean;
}

export class MediaSearch implements ServiceMethods<Data> {
  app: Application
  options: ServiceOptions

  private readonly pageSize = 24

  constructor (options: ServiceOptions, app: Application) {
    this.options = options;
    this.app = app;
  }

  async find (params?: Params): Promise<Data[] | Paginated<Data>> {
    console.log('Find');
    const source = params?.query?.source;
    console.log(source);
    let result;

    // TODO: Add work from black list item

    if (params?.query) {
      params.query = { ...params?.query, pageSize: this.pageSize };
    }
    // TODO: Add more sources
    switch (source) {
      case 'sketchfab': {
        const sketchFabMediaInstance = new SketchFabMedia();
        result = await sketchFabMediaInstance.searchSketchFabMedia(params?.query);
        break;
      }
    }
    return result || [];
  }

  async get (id: Id, params?: Params): Promise<Data> {
    console.log('Get');

    return {
      id, text: `A new message with ID: ${id}!`
    };
  }

  async create (data: Data, params?: Params): Promise<Data> {
    console.log('Create');
    return await Promise.resolve({});
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
