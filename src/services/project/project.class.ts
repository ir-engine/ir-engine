import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../declarations'
import { Params, Id } from '@feathersjs/feathers'

export class Project extends Service {
  app: Application
  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find (params: Params): Promise<[]> {
    const SceneModel = this.app.service('scene').Model
    const OwnedFileModel = this.app.service('owned-file').Model
    // const ParentSceneListingModel = this.app.service('scene-listing').Model

    const projects = await this.getModel(params).findAll({
      attributes: ['name', 'project_id'],
      include: [
        {
          model: SceneModel,
          include: [
            {
              model: OwnedFileModel,
              as: 'model_owned_file',
              attributes: ['key']
            },
            {
              model: OwnedFileModel,
              as: 'screenshot_owned_file',
              attributes: ['key']
            },
            {
              model: OwnedFileModel,
              as: 'scene_owned_file',
              attributes: ['key']
            }
          ]
        },
        {
          model: SceneModel,
          as: 'parent_scene',
          include: [
            {
              model: OwnedFileModel,
              as: 'model_owned_file'
            },
            {
              model: OwnedFileModel,
              as: 'screenshot_owned_file'
            },
            {
              model: OwnedFileModel,
              as: 'scene_owned_file'
            }
          ]
        },
        {
          model: OwnedFileModel,
          as: 'project_owned_file',
          attributes: ['key']
        },
        {
          model: OwnedFileModel,
          as: 'thumbnail_owned_file',
          attributes: ['key']
        }
        /* {
          model: ParentSceneListingModel,
          include: [
            {
              model: OwnedFileModel,
              as: 'model_owned_file'
            },
            {
              model: OwnedFileModel,
              as: 'screenshot_owned_file'
            },
            {
              model: OwnedFileModel,
              as: 'scene_owned_file'
            }
            // :model_owned_file,
            // :screenshot_owned_file,
            // :scene_owned_file,
            // :project,
            // :account,
            // scene: ^Scene.scene_preloads()
          ]
        } */
      ]
    })

    const processedProjects = projects.map((project: any) => this.processProjectDetail(project))

    return processedProjects
  }

  async get (id: Id, params: Params): Promise<any> {
    const SceneModel = this.app.service('scene').Model
    const OwnedFileModel = this.app.service('owned-file').Model
    // const ParentSceneListingModel = this.app.service('scene-listing').Model

    const project = await this.getModel(params).findOne({
      attributes: ['name', 'project_id'],

      where: {
        project_id: id
        // TODO: Fixed authorization, Get only logged in users project
        // userId: params.userß.userId
      },
      include: [
        {
          model: SceneModel,
          include: [
            {
              model: OwnedFileModel,
              as: 'model_owned_file',
              attributes: ['key']
            },
            {
              model: OwnedFileModel,
              as: 'screenshot_owned_file',
              attributes: ['key']
            },
            {
              model: OwnedFileModel,
              as: 'scene_owned_file',
              attributes: ['key']
            }
          ]
        },
        {
          model: SceneModel,
          as: 'parent_scene',
          include: [
            {
              model: OwnedFileModel,
              as: 'model_owned_file',
              attributes: ['key']
            },
            {
              model: OwnedFileModel,
              as: 'screenshot_owned_file',
              attributes: ['key']
            },
            {
              model: OwnedFileModel,
              as: 'scene_owned_file',
              attributes: ['key']
            }
          ]
        },
        {
          model: OwnedFileModel,
          as: 'project_owned_file',
          attributes: ['key']
        },
        {
          model: OwnedFileModel,
          as: 'thumbnail_owned_file',
          attributes: ['key']
        }
        /* {
          model: ParentSceneListingModel,
          include: [
            {
              model: OwnedFileModel,
              as: 'model_owned_file'
            },
            {
              model: OwnedFileModel,
              as: 'screenshot_owned_file'
            },
            {
              model: OwnedFileModel,
              as: 'scene_owned_file'
            }
          ]
        } */
      ]
    })

    return this.processProjectDetail(project)
  }

  async create (data: any, params: Params): Promise<any> {
    const OwnedFileModel = this.app.service('owned-file').Model
    const ProjectModel = this.getModel(params)
    const savedProject = await ProjectModel.create(data)
    const SceneModel = this.app.service('scene').Model
    // TODO: Load scene too
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
          model: SceneModel
        },
        {
          model: SceneModel,
          as: 'parent_scene'
        }
      ]
    })
    return this.processProjectDetail(projectData.toJSON())
  }

  private processProjectDetail (project: any): any {
    const _proj = {
      name: project.name,
      parent_scene: this.mapSceneData(project?.parent_scene_listing || project?.parent_scene, project.project_sid),
      project_id: project.project_id,
      project_url: project?.project_owned_file?.key,
      scene: this.mapSceneData(project.scene, project.project_sid),
      thumbnail_url: project?.thumbnail_owned_file?.key
    }
    return _proj
  }

  private mapSceneData (scene: any, projectId: string): any {
    if (!scene) {
      return null
    }
    return {
      ...scene,
      project_id: projectId,
      // TODO: Define url here
      url: '', // "#{RetWeb.Endpoint.url()}/scenes/#{s |> to_sid}/#{s.slug}"
      model_url: scene?.model_owned_file?.key,
      screenshot_url: scene?.screenshot_owned_file?.key
    }
  }
}
