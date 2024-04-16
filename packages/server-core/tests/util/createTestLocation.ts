import { LocationID, assetPath, locationPath } from '@etherealengine/common/src/schema.type.module'
import { Application } from '@feathersjs/feathers'
import { v4 as uuidv4 } from 'uuid'

export const createTestLocation = async (app: Application, params = { isInternal: true } as any) => {
  const name = `Test Location ${uuidv4()}`

  const project = await app.service('project').find({
    query: {
      name: 'default-project'
    }
  })
  if (project.total === 0) throw new Error(`Project default-project not found`)
  const projectData = project.data[0]

  const scene = await app.service(assetPath).create({
    id: uuidv4(),
    name,
    assetURL: 'projects/default-project/test.scene.json',
    thumbnailURL: 'projects/default-project/test.thumbnail.jpg',
    projectId: projectData.id
  })

  return await app.service(locationPath).create(
    {
      name,
      slugifiedName: '',
      sceneId: scene.id,
      maxUsersPerInstance: 20,
      locationSetting: {
        id: '',
        locationType: 'public',
        audioEnabled: true,
        videoEnabled: true,
        faceStreamingEnabled: false,
        screenSharingEnabled: false,
        locationId: '' as LocationID,
        createdAt: '',
        updatedAt: ''
      },
      isLobby: false,
      isFeatured: false
    },
    { ...params }
  )
}
