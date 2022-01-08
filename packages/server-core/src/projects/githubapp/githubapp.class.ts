import { NullableId, Params, ServiceMethods } from '@feathersjs/feathers'

import { Application } from '../../../declarations'
import { getGitHubAppRepos, getGitRepoById } from './githubapp-helper'

interface Data {}
interface ServiceOptions {}

export class GitHubAppService implements ServiceMethods<Data> {
  app: Application
  options: ServiceOptions
  docs: any

  constructor(options: ServiceOptions = {}, app: Application) {
    this.options = options
    this.app = app
  }

  async setup() {}

  async find(): Promise<any> {
    const repo = await getGitHubAppRepos()
    return repo as any
  }

  async get(id: number): Promise<any> {
    const repo = getGitRepoById(id)
    return repo as any
  }

  async create(): Promise<any> {}

  async update(id: NullableId, data: Data, params: Params): Promise<Data> {
    return data
  }

  async patch(id: NullableId, data: Data, params: Params): Promise<Data> {
    return data
  }

  async remove(id: NullableId, params: Params): Promise<Data> {
    return { id }
  }
}
