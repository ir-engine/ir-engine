import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../declarations'
import { Params, Id } from '@feathersjs/feathers'
import { mapProjectDetailData, defaultProjectImport } from '../project/project-helper'

export class Project extends Service {
  app: Application
  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find (params: Params): Promise<[]> {

    const projects = await this.getModel(params).findAll({
      attributes: ['name', 'project_id'],
      include: defaultProjectImport(this.app.get('sequelizeClient').models)
    })
    const processedProjects = projects.map((project: any) => mapProjectDetailData(project.toJSON()))
    return processedProjects
  }

  async get (id: Id, params: Params): Promise<any> {

    const project = await this.getModel(params).findOne({
      attributes: ['name', 'project_id'],
      where: {
        project_id: id
        // TODO: Fixed authorization, Get only logged in users project
        // userId: params.user.userId
      },
      include: defaultProjectImport(this.app.get('sequelizeClient').models)
    })

    return mapProjectDetailData(project.toJSON())
  }

  async create (data: any, params: Params): Promise<any> {
    const OwnedFileModel = this.app.service('owned-file').Model
    const ProjectModel = this.getModel(params)
    const savedProject = await ProjectModel.create(data, {
      fields: ['name', 'thumbnail_file_id', 'project_file_id', 'created_by_account_id', 'project_sid']
    })
    const SceneModel = this.app.service('scene').Model

    const projectData = await ProjectModel.findOne({
      where: {
        project_id: savedProject.project_id
      },
      attributes: ['name', 'project_id'],
      include: [
        {
          model: OwnedFileModel,
          as: 'project_owned_file',
          attributes: ['key']
        },
        {
          model: OwnedFileModel,
          as: 'thumbnail_owned_file',
          attributes: ['key']
        },
        {
          model: SceneModel,
          attributes: ['account_id', 'allow_promotion', 'allow_remixing', 'attributions', 'description', 'name', 'parent_scene_id', 'scene_id']
        },
        {
          model: SceneModel,
          attributes: ['account_id', 'allow_promotion', 'allow_remixing', 'attributions', 'description', 'name', 'parent_scene_id', 'scene_id'],
          as: 'parent_scene'
        }
      ]
    })
    return mapProjectDetailData(projectData.toJSON())
  }
}
