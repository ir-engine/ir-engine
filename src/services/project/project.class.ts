import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Params, Id, NullableId } from '@feathersjs/feathers'
import { Transaction } from 'sequelize/types'
import fetch from 'node-fetch'

import { mapProjectDetailData, defaultProjectImport } from '../project/project-helper'
import { extractLoggedInUserFromParams } from '../auth-management/auth-management.utils'
import { Application } from '../../declarations'
import StorageProvider from '../../storage/storageprovider'
import { BadRequest } from '@feathersjs/errors'
interface Data { }

export class Project extends Service {
  app: Application
  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find (params: Params): Promise<any> {
    const loggedInUser = extractLoggedInUserFromParams(params)
    const projects = await this.getModel(params).findAll({
      where: {
        created_by_account_id: loggedInUser.userId
      },
<<<<<<< HEAD
      attributes: ['name', 'project_id', 'project_sid', 'project_url', 'collectionId'],
=======
      attributes: ['name', 'project_id', 'project_sid'],
>>>>>>> Implemented short Id in project and scene
      include: defaultProjectImport(this.app.get('sequelizeClient').models)
    })
    const processedProjects = projects.map((project: any) => mapProjectDetailData(project.toJSON()))
    return { projects: processedProjects }
  }

  async get (id: Id, params: Params): Promise<any> {
    const loggedInUser = extractLoggedInUserFromParams(params)
    const project = await this.getModel(params).findOne({
<<<<<<< HEAD
      attributes: ['name', 'project_id', 'project_sid', 'project_url', 'collectionId'],
      where: {
        project_sid: id,
        created_by_account_id: loggedInUser.userId
=======
      attributes: ['name', 'project_id', 'project_sid'],
      where: {
        project_sid: id,
        created_by_account_id: params.user.userId
>>>>>>> Implemented short Id in project and scene
      },
      include: defaultProjectImport(this.app.get('sequelizeClient').models)
    })

    return mapProjectDetailData(project.toJSON())
  }

  async create (data: any, params: Params): Promise<any> {
    const ProjectModel = this.getModel(params)
    const provider = new StorageProvider()
    const storage = provider.getStorage()

    data.collectionId = params.collectionId

    const savedProject = await ProjectModel.create(data, {
<<<<<<< HEAD
      fields: ['name', 'thumbnail_owned_file_id', 'created_by_account_id', 'project_sid', 'project_id', 'collectionId']
=======
      fields: ['name', 'thumbnail_file_id', 'project_file_id', 'created_by_account_id', 'project_sid', 'project_id']
>>>>>>> Implemented short Id in project and scene
    })
    const projectData = await this.reloadProject(savedProject.project_id, savedProject)

    // After saving project, remove the project json file from s3, as we have saved that on database in collection table
    const tempOwnedFileKey = params.ownedFile.key
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

  async patch (projectId: NullableId, data: any, params: Params): Promise<any> {
    const loggedInUser = extractLoggedInUserFromParams(params)
    const seqeulizeClient = this.app.get('sequelizeClient')
    const models = seqeulizeClient.models
    const CollectionModel = models.collection
    const EntityModel = models.entity
    const OwnedFileModel = models.owned_file
    const ComponentModel = models.component
    const ComponentTypeModel = models.component_type
    const provider = new StorageProvider()
    const storage = provider.getStorage()

    // TODO: Get other scene data too if there is any parent too
    // After creating of project, remove the owned_file of project json

    // Find the project owned_file from database
    const ownedFile = await OwnedFileModel.findOne({
      where: {
        owned_file_id: data.owned_file_id
      },
<<<<<<< HEAD
      raw: true
    })

    if (!ownedFile) {
      return await Promise.reject(new BadRequest('Project File not found!'))
    }
    const sceneData = await fetch(ownedFile.url).then(res => res.json())
    const project = await this.getModel(params).findOne({
      where: {
        created_by_account_id: loggedInUser.userId,
        project_sid: projectId
      }
    })

    if (!project) {
      return await Promise.reject(new BadRequest('Project not found Or you don\'t have access!'))
    }

    return seqeulizeClient.transaction(async (transaction: Transaction) => {
      // First delete existing collection, entity and components and create new ones
      await CollectionModel.destroy({
        where: {
          id: project.collectionId
        },
        transaction
      })

      const savedCollection = await CollectionModel.create({
        type: 'project',
        name: data.name,
        metadata: sceneData.metadata,
        version: sceneData.version,
        userId: loggedInUser.userId
      }, { transaction })

      const sceneEntitiesArray: any = []

      for (const prop in sceneData.entities) {
        sceneEntitiesArray.push({ entityId: prop, ...sceneData.entities[prop] })
      }

      const entites = sceneEntitiesArray.map((entity: any) => {
        entity.name = entity.name.toLowerCase()
        entity.type = 'default'
        entity.userId = loggedInUser.userId
        entity.collectionId = savedCollection.id
        return entity
      })
      const savedEntities = await EntityModel.bulkCreate(entites, { transaction })
      const components: any = []
      const componetTypeSet = new Set()
      savedEntities.forEach((savedEntity: any, index: number) => {
        const entity = sceneEntitiesArray[index]
        entity.components.forEach((component: any) => {
          componetTypeSet.add(component.name.toLowerCase())
          components.push(
            {
              data: component.props,
              entityId: savedEntity.id,
              type: component.name.toLowerCase(),
              userId: loggedInUser.userId,
              collection: savedCollection.id
              // TODO: Manage Static_RESOURCE
            }
          )
        })
      })
      // Now we check if any of component-type is missing, then create that one
      let savedComponentTypes = await ComponentTypeModel.findAll({
        where: {
          type: Array.from(componetTypeSet)
        },
        raw: true,
        attributes: ['type']
      })

      savedComponentTypes = savedComponentTypes.map((item: any) => item.type)
      if (savedComponentTypes.length <= componetTypeSet.size) {
        let nonExistedComponentTypes = Array.from(componetTypeSet).filter((item) => savedComponentTypes.indexOf(item) < 0)

        nonExistedComponentTypes = nonExistedComponentTypes.map((item) => {
          return {
            type: item
          }
        })
        await ComponentTypeModel.bulkCreate(nonExistedComponentTypes, { transaction })
      }
      await ComponentModel.bulkCreate(components, { transaction })

      data.collectionId = savedCollection.id
      await project.update(data, { fields: ['name', 'thumbnail_owned_file_id', 'updatedAt', 'collectionId'], transaction })
      const savedProject = await this.reloadProject(project.project_id, project)

      // After saving project, remove the project json file from s3, as we have saved that on database in collection table
      const tempOwnedFileKey = ownedFile.key
      storage.remove({
        key: tempOwnedFileKey
      }, (err: any, result: any) => {
        if (err) {
          console.log('Storage removal error')
          console.log('Error in removing project temp Owned file: ', err)
=======
      attributes: ['name', 'project_id', 'project_sid'],
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
          attributes: ['account_id', 'allow_promotion', 'allow_remixing', 'attributions', 'description', 'name', 'parent_scene_id', 'scene_id', 'scene_sid']
        },
        {
          model: SceneModel,
          attributes: ['account_id', 'allow_promotion', 'allow_remixing', 'attributions', 'description', 'name', 'parent_scene_id', 'scene_id', 'scene_sid'],
          as: 'parent_scene'
>>>>>>> Implemented short Id in project and scene
        }
        console.log('Project temp Owned file removed result: ', result)
      })
      return mapProjectDetailData(savedProject.toJSON())
    })
  }

  private async reloadProject (projectId: string, loadedProject?: any): Promise<any> {
    const seqeulizeClient = this.app.get('sequelizeClient')
    const models = seqeulizeClient.models
    const OwnedFileModel = models.owned_file
    const ProjectModel = models.project
    const SceneModel = this.app.service('scene').Model
    const projectIncludes: any = [
      {
        model: OwnedFileModel,
        as: 'thumbnail_owned_file',
        attributes: ['url']
      }
    ]

    if (loadedProject?.scene_id) {
      projectIncludes.push({
        model: SceneModel,
        attributes: ['account_id', 'allow_promotion', 'allow_remixing', 'attributions', 'description', 'name', 'parent_scene_id', 'scene_id', 'scene_sid']
      })
    }

    if (loadedProject?.parent_scene_id) {
      projectIncludes.push({
        model: SceneModel,
        attributes: ['account_id', 'allow_promotion', 'allow_remixing', 'attributions', 'description', 'name', 'parent_scene_id', 'scene_id', 'scene_sid'],
        as: 'parent_scene'
      })
    }

    const projectData = await ProjectModel.findOne({
      where: {
        project_id: projectId
      },
      attributes: ['name', 'project_id', 'project_sid', 'project_url', 'thumbnail_owned_file_id', 'collectionId'],
      include: projectIncludes
    })

    return projectData
  }
}
