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
    const UserModel = this.app.service('user').Model
    const OwnedFileModel = this.app.service('owned-file').Model
    const ParentSceneListingModel = this.app.service('scene-listing').Model

    const groups = await this.getModel(params).findAll({
      include: [
        {
          model: UserModel
        },
        {
          model: SceneModel
        },
        {
          model: SceneModel,
          as: 'parent_scene'
        },
        {
          model: OwnedFileModel,
          as: 'project_owned_file'
        },
        {
          model: OwnedFileModel,
          as: 'thumbnail_owned_file'
        },
        {
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
        }
        // {
        //   model: AssetModel
        // }
      ]
    })

    return groups
  }

  async get (id: Id, params: Params): Promise<any> {
    await super.get(id, params)
    const SceneModel = this.app.service('scene').Model
    const UserModel = this.app.service('user').Model
    const OwnedFileModel = this.app.service('owned-file').Model
    const ParentSceneListingModel = this.app.service('scene-listing').Model

    const groups = await this.getModel(params).findOne({
      where: {
        groupId: id,
        userId: params.user.userId
      },
      include: [
        {
          model: UserModel
        },
        {
          model: SceneModel
        },
        {
          model: SceneModel,
          as: 'parent_scene'
        },
        {
          model: OwnedFileModel,
          as: 'project_owned_file'
        },
        {
          model: OwnedFileModel,
          as: 'thumbnail_owned_file'
        },
        {
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
        }
        // {
        //   model: AssetModel
        // }
      ]
    })

    return groups
  }

  async create (data: any, params: Params): Promise<any> {
    // name: scene.name,
    //   thumbnail_file_id,
    //   thumbnail_file_token,
    //   project_file_id,
    //   project_file_token

  }
}
