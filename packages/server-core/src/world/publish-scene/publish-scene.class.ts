import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers'
import Paginated from '../../types/PageObject'
import { Forbidden } from '@feathersjs/errors'
import { Transaction } from 'sequelize/types'
import { Application } from '../../../declarations'
import { mapSceneDetailData, defaultSceneImport } from '../scene/scene-helper'
import StorageProvider from '../../media/storageprovider/storageprovider'
import { collectionType } from '../../entities/collection-type/collectionType'

interface Data {}

interface ServiceOptions {}

/**
 * A class for Publish Project  service
 *
 * @author Vyacheslav Solovjov
 */
export class PublishProject implements ServiceMethods<Data> {
  app: Application
  options: ServiceOptions
  docs: any

  constructor(options: ServiceOptions = {}, app: Application) {
    this.options = options
    this.app = app
  }

  async setup() {}

  /**
   * A function which is used to display all published project
   * @param params
   * @returns all published project
   */
  async find(params?: Params): Promise<Data[] | Paginated<Data>> {
    return []
  }

  /**
   * A function which is used to get specific publish project
   *
   * @param id of publish project
   * @param params
   * @returns {@Object} contains id of publish project and message
   * @author Vyacheslav Solovjov
   */
  async get(id: Id, params?: Params): Promise<Data> {
    return {
      id,
      text: `A new message with ID: ${id}!`
    }
  }

  /**
   * A function which is used to create publish project
   *
   * @param data of new publish project
   * @param params contains user info
   * @returns created new publish project
   * @author Vyacheslav Solovjov
   */
  async create(data: any, params: Params): Promise<Data> {
    const CollectionModel = (this.app.service('collection') as any).Model
    const projectId = params?.query?.projectId

    // const loggedInUser = extractLoggedInUserFromParams(params)
    const provider = new StorageProvider()
    const storage = provider.getStorage()
    const project = await CollectionModel.findOne({
      where: { sid: projectId, type: 'scene' }
    }) /* , creatorUserId: loggedInUser.userId */

    if (!project) {
      return await Promise.reject(new Forbidden("Project not found Or you don't have access!"))
    }

    data.collectionId = params.collectionId

    await this.app.get('sequelizeClient').transaction(async (trans: Transaction) => {
      const savedScene = await CollectionModel.create(data, {
        type: collectionType.scene,
        transaction: trans,
        fields: [
          'screenshotOwnedFileId',
          'modelOwnedFileId',
          'name',
          'ownerUserId',
          'slug',
          'state',
          'sceneId',
          'sid',
          'collectionId'
        ]
      })
      project.sceneId = savedScene.id

      await project.save({ transaction: trans })
      // After saving project, remove the project json file from s3, as we have saved that on database in collection table
      const tempOwnedFileKey = params.ownedFile.key
      storage.remove(
        {
          key: tempOwnedFileKey
        },
        (err: any, result: any) => {
          if (err) {
            console.log('Storage removal error')
            console.log('Error in removing project temp Owned file: ', err)
            return err
          }
          console.log('Project temp Owned file removed result: ', result)
        }
      )
    })

    const projectData = await CollectionModel.findOne({
      where: {
        sid: project.sid,
        type: collectionType.scene
      },
      attributes: ['name', 'id', 'sid'],
      include: defaultSceneImport(this.app.get('sequelizeClient').models)
    })
    return mapSceneDetailData(projectData.toJSON())
  }

  /**
   * A function which is used to update publish project
   *
   * @param id
   * @param data of new publish project
   * @param params
   * @returns {@Object} updated project
   * @author Vyacheslav Solovjov
   */
  async update(id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data
  }

  async patch(id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data
  }

  /**
   *
   * @param id of specific project
   * @param params
   * @returns {@Object} removed publish project
   * @author Vyacheslav Solovjov
   */
  async remove(id: NullableId, params?: Params): Promise<Data> {
    return { id }
  }
}
