import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { indexes } from '../../scenes-templates';

interface Data {}

interface ServiceOptions {
  paginate: boolean;
}

/**
 * A class for media search service 
 * 
 * @author Vyacheslav Solovjov
 */

export class MediaSearch implements ServiceMethods<Data> {
  app: Application
  options: ServiceOptions
  docs: any

  private readonly pageSize = 24

  constructor (options: ServiceOptions, app: Application) {
    this.options = options;
    this.app = app;
  }

  /**
   * A function which find all media and display it 
   * 
   * @param params with source of media 
   * @returns {@Array} of media 
   * @author Vyacheslav Solovjov
   */
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
      case 'asset': {
         //TODO Do some stuff here to get user's assets
         result = {
          meta: {
            source: null,
            next_cursor: null
          },
          entries: [],
          suggestions: null
          };
        break;
      }
      case 'scene_listings': {
        result = indexes;
        break;
      }
    }
    return result || [];
  }

  /**
   * A function which is used to find specific media 
   * 
   * @param id of media 
   * @param params 
   * @returns {@Object} with id and message 
   * @author Vyacheslav Solovjov
   */
  async get (id: Id, params?: Params): Promise<Data> {
    console.log('Get');

    return {
      id, text: `A new message with ID: ${id}!`
    };
  }

  /**
   * NB: This function doesn't do anything
   * @param data 
   * @param params 
   */
  async create (data: Data, params?: Params): Promise<Data> {
    console.log('Create');
    return await Promise.resolve({});
  }

  /**
   * A function used to update media 
   * 
   * @param id 
   * @param data 
   * @param params 
   * @returns data 
   */
  async update (id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data;
  }
   /**
   * A function used to update media 
   * 
   * @param id 
   * @param data 
   * @param params 
   * @returns data 
   */
  async patch (id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data;
  }

  /**
   * A function used to remove specific media 
   * 
   * @param id for specific media 
   * @param params 
   * @returns id 
   */
  async remove (id: NullableId, params?: Params): Promise<Data> {
    return { id };
  }
}
