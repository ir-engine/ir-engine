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

export function readJSONFromBlobStore(storage, key) {
  return new Promise((resolve, reject) => {
    let chunks = {}
    storage
      .createReadStream({
        key
      })
      .on('data', (data: object) => {
        const parsedData = JSON.parse(data.toString())
        chunks = Object.assign(chunks, parsedData)
      })
      .on('end', () => {
        resolve(chunks)
      })
      .on('error', reject)
  })
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
