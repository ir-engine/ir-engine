import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { GithubRepoAccessInterface } from '@etherealengine/common/src/dbmodels/GithubRepoAccess'

import { Application } from '../../../declarations'

/**
 * A class for github-repo-access service
 */
export class GithubRepoAccess<T = GithubRepoAccessInterface> extends Service<T> {
  public app: Application
  public docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }
}
