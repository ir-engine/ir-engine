import { Params, Id, NullableId, ServiceMethods } from '@feathersjs/feathers';
import { Transaction } from 'sequelize/types';
import fetch from 'node-fetch';

import { mapProjectDetailData, defaultProjectImport } from '../project/project-helper';
import { extractLoggedInUserFromParams } from '../auth-management/auth-management.utils';
import { Application } from '../../declarations';
import StorageProvider from '../../storage/storageprovider';
import { BadRequest } from '@feathersjs/errors';
interface Data { }
interface ServiceOptions {}

export class Project implements ServiceMethods<Data> {
  app: Application
  options: ServiceOptions
  models: any

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
    this.models = this.app.get('sequelizeClient').models;
  }

  async find (params: Params): Promise<any> {
    const loggedInUser = extractLoggedInUserFromParams(params);
    const projects = await this.models.collection.findAll({
      where: {
        userId: loggedInUser.userId
      },
      attributes: ['name', 'id', 'sid', 'url'],
      include: defaultProjectImport(this.app.get('sequelizeClient').models)
    });
    const processedProjects = projects.map((project: any) => mapProjectDetailData(project.toJSON()));
    return { projects: processedProjects };
  }

  async get (id: Id, params: Params): Promise<any> {
    const loggedInUser = extractLoggedInUserFromParams(params);
    const project = await this.models.collection.findOne({
      attributes: ['name', 'id', 'sid', 'url', 'type'],
      where: {
        sid: id,
        userId: loggedInUser.userId
      },
      include: defaultProjectImport(this.app.get('sequelizeClient').models)
    });

    if (!project) {
      return await Promise.reject(new BadRequest('Project not found Or you don\'t have access!'));
    }

    return mapProjectDetailData(project.toJSON());
  }

  async create (data: any, params: Params): Promise<any> {
    const provider = new StorageProvider();
    const storage = provider.getStorage();

    // After saving project, remove the project json file from s3, as we have saved that on database in collection table
    const tempOwnedFileKey = params.ownedFile.key;
    storage.remove({
      key: tempOwnedFileKey
    }, (err: any, result: any) => {
      if (err) {
        console.log('Storage removal error');
        console.log('Error in removing project temp Owned file: ', err);
      }
      console.log('Project temp Owned file removed result: ', result);
    });
    return mapProjectDetailData(params.collection);
  }

  async update (id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data;
  }

  async patch (projectId: NullableId, data: any, params: Params): Promise<any> {
    const loggedInUser = extractLoggedInUserFromParams(params);
    const seqeulizeClient = this.app.get('sequelizeClient');
    const models = seqeulizeClient.models;
    const CollectionModel = models.collection;
    const EntityModel = models.entity;
    const StaticResourceModel = models.static_resource;
    const ComponentModel = models.component;
    const ComponentTypeModel = models.component_type;
    const provider = new StorageProvider();
    const storage = provider.getStorage();

    const project = await CollectionModel.findOne({
      where: {
        sid: projectId,
        userId: loggedInUser.userId
      }
    });

    if (!project) {
      return await Promise.reject(new BadRequest('Project not found Or you don\'t have access!'));
    }

    // Find the project owned_file from database
    const ownedFile = await StaticResourceModel.findOne({
      where: {
        id: data.ownedFileId
      },
      raw: true
    });

    if (!ownedFile) {
      return await Promise.reject(new BadRequest('Project File not found!'));
    }
    const sceneData = await fetch(ownedFile.url).then(res => res.json());
    await seqeulizeClient.transaction(async (transaction: Transaction) => {
      project.update({
        name: data.name,
        metadata: sceneData.metadata,
        version: sceneData.version
      }, { fields: ['name', 'metadata', 'version'], transaction });

      // First delete existing collection, entity and components and create new ones
      // Delete all entities belongs to collection, as we have added constraint that on entity remove, remove all their components too
      await EntityModel.destroy({
        where: {
          collectionId: project.id
        },
        transaction
      });

      const sceneEntitiesArray: any = [];

      for (const prop in sceneData.entities) {
        sceneEntitiesArray.push({ entityId: prop, ...sceneData.entities[prop] });
      }

      const entites = sceneEntitiesArray.map((entity: any) => {
        entity.name = entity.name.toLowerCase();
        entity.type = 'default';
        entity.userId = loggedInUser.userId;
        entity.collectionId = project.id;
        return entity;
      });
      const savedEntities = await EntityModel.bulkCreate(entites, { transaction });
      const components: any = [];
      const componetTypeSet = new Set();
      savedEntities.forEach((savedEntity: any, index: number) => {
        const entity = sceneEntitiesArray[index];
        entity.components.forEach((component: any) => {
          componetTypeSet.add(component.name.toLowerCase());
          components.push(
            {
              data: component.props,
              entityId: savedEntity.id,
              type: component.name.toLowerCase(),
              userId: loggedInUser.userId,
              collection: project.id
            }
          );
        });
      });
      // Now we check if any of component-type is missing, then create that one
      let savedComponentTypes = await ComponentTypeModel.findAll({
        where: {
          type: Array.from(componetTypeSet)
        },
        raw: true,
        attributes: ['type']
      });

      savedComponentTypes = savedComponentTypes.map((item: any) => item.type);
      if (savedComponentTypes.length <= componetTypeSet.size) {
        let nonExistedComponentTypes = Array.from(componetTypeSet).filter((item) => savedComponentTypes.indexOf(item) < 0);

        nonExistedComponentTypes = nonExistedComponentTypes.map((item) => {
          return {
            type: item
          };
        });
        await ComponentTypeModel.bulkCreate(nonExistedComponentTypes, { transaction });
      }
      await ComponentModel.bulkCreate(components, { transaction });

      // After saving project, remove the project json file from s3, as we have saved that on database in collection table
      const tempOwnedFileKey = ownedFile.key;
      storage.remove({
        key: tempOwnedFileKey
      }, (err: any, result: any) => {
        if (err) {
          console.log('Storage removal error');
          console.log('Error in removing project temp Owned file: ', err);
        }
        console.log('Project temp Owned file removed result: ', result);
      });
    });

    const savedProject = await this.reloadProject(project.id, project);
    return mapProjectDetailData(savedProject.toJSON());
  }

  async remove (id: NullableId, params?: Params): Promise<Data> {
    if (!params.query.projectId) return { id };

    const { collection } = this.models;
    await collection.destroy({
      where: {
        sid: params.query.projectId
      }
    });
    return {
      id: params.query.projectId
    };
  }

  private async reloadProject (projectId: string, loadedProject?: any): Promise<any> {
    const seqeulizeClient = this.app.get('sequelizeClient');
    const models = seqeulizeClient.models;
    const StaticResourceModel = models.static_resource;
    const CollectionModel = this.app.service('collection').Model;
    const projectIncludes: any = [
      {
        model: StaticResourceModel,
        as: 'thumbnail_owned_file',
        attributes: ['url']
      }
    ];

    if (loadedProject?.sceneId) {
      projectIncludes.push({
        model: CollectionModel,
        attributes: ['userId', 'allow_promotion', 'allow_remixing', 'attribution', 'description', 'name', 'parentSceneId', 'sceneId', 'sid']
      });
    }

    if (loadedProject?.parentSceneId) {
      projectIncludes.push({
        model: CollectionModel,
        attributes: ['userId', 'allow_promotion', 'allow_remixing', 'attribution', 'description', 'name', 'parentSceneId', 'sceneId', 'sid'],
        as: 'parent_scene'
      });
    }

    const projectData = await CollectionModel.findOne({
      where: {
        id: projectId
      },
      attributes: ['name', 'id', 'sid', 'url', 'thumbnailOwnedFileId'],
      include: projectIncludes
    });

    return projectData;
  }
}
