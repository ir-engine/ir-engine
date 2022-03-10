import { SequelizeServiceOptions } from 'feathers-sequelize'

import { Application } from '../../../declarations'
import { Project } from '../../projects/project/project.class'

export class ProjectSetting extends Project {
  app: Application

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options, app)
    this.app = app
  }
}
