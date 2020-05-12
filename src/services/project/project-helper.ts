import config from 'config'

export const mapProjectDetailData = (project: any): any => {
  const _proj = {
    name: project.name,
    parent_scene: mapSceneData(project?.parent_scene_listing || project?.parent_scene, project.project_id),
    project_id: project.project_id,
    project_url: project?.project_owned_file?.key,
    scene: mapSceneData(project.scene, project.project_id),
    thumbnail_url: project?.thumbnail_owned_file?.key
  }
  return _proj
}

export const mapSceneData = (scene: any, projectId: string): any => {
  if (!scene) {
    return null
  }
  const selectedSceneData = {
    ...scene,
    project_id: projectId,
    url: `${(config.get('hub.endpoint') as string)}/scenes/${(scene.slug as string)}`,
    model_url: scene?.model_owned_file?.key,
    screenshot_url: scene?.screenshot_owned_file?.key
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
      as: 'project_owned_file',
      attributes: ['key']
    },
    {
      model: models.owned_file,
      as: 'thumbnail_owned_file',
      attributes: ['key']
    },
    {
      model: models.scene,
      attributes: ['account_id', 'allow_promotion', 'allow_remixing', 'attributions', 'description', 'name', 'parent_scene_id', 'scene_id', 'slug'],
      include: [
        {
          model: models.owned_file,
          as: 'model_owned_file',
          attributes: ['key']
        },
        {
          model: models.owned_file,
          as: 'screenshot_owned_file',
          attributes: ['key']
        }
      ]
    },
    {
      model: models.scene,
      attributes: ['account_id', 'allow_promotion', 'allow_remixing', 'attributions', 'description', 'name', 'parent_scene_id', 'scene_id', 'slug'],
      as: 'parent_scene',
      include: [
        {
          model: models.owned_file,
          as: 'model_owned_file',
          attributes: ['key']
        },
        {
          model: models.owned_file,
          as: 'screenshot_owned_file',
          attributes: ['key']
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
