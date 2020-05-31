import config from '../../config'

export function mapProjectDetailData (project: any): any {
  const _proj = {
    name: project.name,
    parent_scene: mapSceneData(project?.parent_scene_listing || project?.parent_scene, project.sid),
    projectId: project.sid,
    url: project?.url,
    scene: mapSceneData(project.scene, project.sid),
    thumbnail_url: project?.thumbnail_owned_file?.url
  }
  return _proj
}

export function mapSceneData (scene: any, projectId: string): any {
  if (!scene) {
    return null
  }
  const selectedSceneData = {
    ...scene,
    sceneId: scene?.sid,
    projectId,
    url: `${(config.server.hub.endpoint as string)}/scene/${(scene.slug as string)}`,
    model_url: scene?.model_owned_file?.url,
    screenshot_url: scene?.screenshot_owned_file?.url
  }
  delete selectedSceneData.model_owned_file
  delete selectedSceneData.screenshot_owned_file
  delete selectedSceneData.scene_owned_file
  return selectedSceneData
}
export function defaultProjectImport (models: any): any[] {
  const includedEntities = [
    {
      model: models.owned_file,
      as: 'thumbnail_owned_file',
      attributes: ['url']
    },
    {
      model: models.scene,
      attributes: ['ownerUserId', 'allow_promotion', 'allow_remixing', 'attributions', 'description', 'name', 'parentSceneId', 'sceneId', 'slug', 'sid'],
      include: [
        {
          model: models.owned_file,
          as: 'model_owned_file',
          attributes: ['url']
        },
        {
          model: models.owned_file,
          as: 'screenshot_owned_file',
          attributes: ['url']
        }
      ]
    },
    {
      model: models.scene,
      attributes: ['ownerUserId', 'allow_promotion', 'allow_remixing', 'attributions', 'description', 'name', 'parentSceneId', 'sceneId', 'slug', 'sid'],
      as: 'parent_scene',
      include: [
        {
          model: models.owned_file,
          as: 'model_owned_file',
          attributes: ['url']
        },
        {
          model: models.owned_file,
          as: 'screenshot_owned_file',
          attributes: ['url']
        }
      ]
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
  return includedEntities
}
