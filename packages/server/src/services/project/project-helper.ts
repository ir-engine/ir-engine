import config from '../../config';

export function mapSceneData (scene: any, projectId: string): any {
  if (!scene) {
    return null;
  }
  const selectedSceneData = {
    ...scene,
    sceneId: scene?.sid,
    project_id: projectId,
    url: `${(config.server.hub.endpoint)}/scene/${(scene.slug as string)}`,
    model_url: scene?.model_owned_file?.url,
    screenshot_url: scene?.screenshot_owned_file?.url
  };
  delete selectedSceneData.model_owned_file;
  delete selectedSceneData.screenshot_owned_file;
  delete selectedSceneData.scene_owned_file;
  return selectedSceneData;
}
export function defaultProjectImport (models: any): any[] {
  const includedEntities = [
    {
      model: models.static_resource,
      as: 'thumbnail_owned_file',
      attributes: ['url']
    }
    /* {
      model: models.collection,
      attributes: ['collectionType', 'userId', 'allow_promotion', 'allow_remixing', 'attribution', 'description', 'name', 'parentSceneId', 'sceneId', 'slug', 'sid'],
      include: [
        {
          model: models.static_resource,
          as: 'model_owned_file',
          attributes: ['staticResourceType', 'url']
        },
        {
          model: models.static_resource,
          as: 'screenshot_owned_file',
          attributes: ['staticResourceType', 'url']
        }
      ]
    },
    {
      model: models.collection,
      attributes: ['collectionType', 'ownerUserId', 'allow_promotion', 'allow_remixing', 'attribution', 'description', 'name', 'parentSceneId', 'sceneId', 'slug', 'sid'],
      as: 'parent_scene',
      include: [
        {
          model: models.static_resource,
          as: 'model_owned_file',
          attributes: ['staticResourceType', 'url']
        },
        {
          model: models.static_resource,
          as: 'screenshot_owned_file',
          attributes: ['staticResourceType', 'url']
        }
      ]
    } */
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
  ];
  return includedEntities;
}

export function readJSONFromBlobStore(storage, key): any {
  return new Promise((resolve, reject) => {
    let chunks = {};
    storage
      .createReadStream({
        key
      })
      .on('data', (data: object) => {
        const parsedData = JSON.parse(data.toString());
        chunks = Object.assign(chunks, parsedData);
      })
      .on('end', () => {
        resolve(chunks);
      })
      .on('error', reject);
  });
}

export function mapProjectDetailData (project: any): any {
  const _proj = {
    name: project.name,
    parent_scene: mapSceneData(project?.parent_scene_listing || project?.parent_scene, project.sid),
    project_id: project.sid,
    project_url: project?.url,
    scene: mapSceneData(project.scene, project.sid),
    thumbnailUrl: project?.thumbnail_owned_file?.url
  };
  return _proj;
}

export function mapProjectTemplateDetailData (projectTemplate: any): any {
  const selectedSceneData = {
    ...projectTemplate,
    sceneId: null,
    project_id: projectTemplate.sid,
    url: null,
    model_url: null,
    screenshot_url: projectTemplate?.thumbnail_file?.url
  };
  /*
id: "251dd580-5caa-11eb-88f7-41085bb160dd"
isPublic: true
locationId: null
metadata: "{"name":"Sky Island"}"
name: "Sky Island"
root: "2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC"
sid: "rjexuC2v"
thumbnailOwnedFileId: "25001450-5caa-11eb-816b-4782c6a01287"
type: "project"
updatedAt: "2021-01-22T12:05:40.000Z"
url: "https://localhost:3030/collection/251dd580-5caa-11eb-88f7-41085bb160dd"
userId: "084ffae0-5c15-11eb-9c41-59a7d7252cfc"
version: 4
   */

  const _proj = {
    name: projectTemplate.name,
    parent_scene: null,
    project_id: projectTemplate.sid,
    project_url: null,
    scenes: [ selectedSceneData ],
    thumbnailUrl: projectTemplate?.thumbnail_file?.url
  };
  return _proj;
}