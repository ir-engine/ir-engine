import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../declarations'
import { Params, Id } from '@feathersjs/feathers'
import { mapProjectDetailData, defaultProjectImport } from '../project/project-helper'
import { extractLoggedInUserFromParams } from '../auth-management/auth-management.utils'
import StorageProvider from '../../storage/storageprovider'

export class Project extends Service {
  app: Application
  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find (params: Params): Promise<[]> {
    const loggedInUser = extractLoggedInUserFromParams(params)
    const projects = await this.getModel(params).findAll({
      where: {
        created_by_account_id: loggedInUser.userId
      },
      attributes: ['name', 'project_id', 'project_sid', 'project_url', 'collectionId'],
      include: defaultProjectImport(this.app.get('sequelizeClient').models)
    })
    const processedProjects = projects.map((project: any) => mapProjectDetailData(project.toJSON()))
    return processedProjects
  }

  async get (id: Id, params: Params): Promise<any> {
    const loggedInUser = extractLoggedInUserFromParams(params)
    const project = await this.getModel(params).findOne({
      attributes: ['name', 'project_id', 'project_sid', 'project_url', 'collectionId'],
      where: {
        project_sid: id,
        created_by_account_id: loggedInUser.userId
      },
      include: defaultProjectImport(this.app.get('sequelizeClient').models)
    })

    return mapProjectDetailData(project.toJSON())
  }

  async create (data: any, params: Params): Promise<any> {
    const OwnedFileModel = this.app.service('owned-file').Model
    const ProjectModel = this.getModel(params)
    const SceneModel = this.app.service('scene').Model
    const provider = new StorageProvider()
    const storage = provider.getStorage()

    data.collectionId = params.collectionId

    const savedProject = await ProjectModel.create(data, {
      fields: ['name', 'thumbnail_file_id', 'project_file_id', 'created_by_account_id', 'project_sid', 'project_id', 'collectionId']
    })

    // TODO: After creating project, removed the file from s3
    const projectData = await ProjectModel.findOne({
      where: {
        project_id: savedProject.project_id
      },
      attributes: ['name', 'project_id', 'project_sid', 'project_url'],
      include: [
        {
          model: OwnedFileModel,
          as: 'thumbnail_owned_file',
          attributes: ['url']
        },
        {
          model: SceneModel,
          attributes: ['account_id', 'allow_promotion', 'allow_remixing', 'attributions', 'description', 'name', 'parent_scene_id', 'scene_id', 'scene_sid']
        },
        {
          model: SceneModel,
          attributes: ['account_id', 'allow_promotion', 'allow_remixing', 'attributions', 'description', 'name', 'parent_scene_id', 'scene_id', 'scene_sid'],
          as: 'parent_scene'
        }
      ]
    })

    // After saving project, remove the project json file from s3, as we have saved that on database in collection table
    const tempOwnedFileKey = params.ownedFile.key
    console.log(tempOwnedFileKey)
    storage.remove({
      key: tempOwnedFileKey
    }, (err: any, result: any) => {
      if (err) {
        console.log('Storage removal error')
        console.log('Error in removing project temp Owned file: ', err)
      }
      console.log('Project temp Owned file removed result: ', result)
    })
    return mapProjectDetailData(projectData.toJSON())
  }
}
