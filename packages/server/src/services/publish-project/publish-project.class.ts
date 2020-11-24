import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers';
import { Forbidden } from '@feathersjs/errors';
import { Transaction } from 'sequelize/types';
import { Application } from '../../declarations';
import { mapProjectDetailData, defaultProjectImport } from '../project/project-helper';
import StorageProvider from '../../storage/storageprovider';
import { collectionType } from '../../enums/collection';

interface Data {}

interface ServiceOptions {}

export class PublishProject implements ServiceMethods<Data> {
  app: Application
  options: ServiceOptions

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  async find (params?: Params): Promise<Data[] | Paginated<Data>> {
    return [];
  }

  async get (id: Id, params?: Params): Promise<Data> {
    return {
      id, text: `A new message with ID: ${id}!`
    };
  }

  async create (data: any, params: Params): Promise<Data> {
    const CollectionModel = this.app.service('collection').Model;
    const projectId = params?.query?.projectId;
    // const loggedInUser = extractLoggedInUserFromParams(params)
    const provider = new StorageProvider();
    const storage = provider.getStorage();
    const project = await CollectionModel.findOne({ where: { sid: projectId, type: 'project' } }); /* , creatorUserId: loggedInUser.userId */

    if (!project) {
      return await Promise.reject(new Forbidden('Project not found Or you don\'t have access!'));
    }

    data.collectionId = params.collectionId;

    await this.app.get('sequelizeClient').transaction(async (trans: Transaction) => {
      const savedScene = await CollectionModel.create(data, {
        type: collectionType.scene,
        transaction: trans,
        fields: ['screenshotOwnedFileId', 'modelOwnedFileId', 'allow_remixing', 'allow_promotion', 'name', 'ownerUserId', 'slug', 'state', 'sceneId', 'sid', 'collectionId']
      });
      project.sceneId = savedScene.id;

      await project.save({ transaction: trans });
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
    });

    const projectData = await CollectionModel.findOne({
      where: {
        sid: project.sid,
        type: collectionType.project
      },
      attributes: ['name', 'id', 'sid'],
      include: defaultProjectImport(this.app.get('sequelizeClient').models)
    });
    return mapProjectDetailData(projectData.toJSON());
  }

  async update (id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data;
  }

  async patch (id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data;
  }

  async remove (id: NullableId, params?: Params): Promise<Data> {
    return { id };
  }
}
