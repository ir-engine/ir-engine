import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { UserInputError } from 'apollo-server'

interface Data {}

interface ServiceOptions {}

export class RealtimeStore implements ServiceMethods<Data> {
  app: Application;
  options: ServiceOptions;
  store: any

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  async find (params?: Params): Promise<Data[] | Paginated<Data> | UserInputError> {
    let substore = this.store[(params as any).type]

    if (substore == null) { return new UserInputError('Invalid type ') }
    return Object.keys(substore).map((name) => { return substore[name]})
  }

  async get (id: Id, params?: Params): Promise<Data> {
    let substore = this.store[(params as any).type]

    if (substore == null) { return new UserInputError('Invalid type ') }
    if (id == null || substore[id] == null) { return new UserInputError('Invalid User ID ') }
    return substore[id]
  }

  async create (data: Data, params?: Params): Promise<Data> {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current, params)));
    }

    let substore = this.store[(data as any).type]
    let object = (data as any).object
    substore[object.id] = object

    return object;
  }

  async update (id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data;
  }

  async patch (id: NullableId, data: Data, params?: Params): Promise<Data> {
    let substore = this.store[(data as any).type]

    if (substore == null) { return new UserInputError('Invalid type ') }
    if (id == null || substore[id] == null) { return new UserInputError('Invalid User ID ') }
    substore[id] = Object.assign({}, substore[id], (data as any).object)
    return substore[id]
  }

  async remove (id: NullableId, params?: Params): Promise<Data> {
    let substore = this.store[(params as any).type]
    if (substore == null) { return new UserInputError('Invalid type ') }
    if (id != null) { delete substore[id] }

    return { id };
  }
}
