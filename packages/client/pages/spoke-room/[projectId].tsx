import Layout from '../../components/ui/Layout'
import { useRouter } from 'next/router'
import Error404 from '../404'
import React, { useEffect } from 'react'
import { Camera } from 'three'
import { client } from '../../redux/feathers'

const projectRegex = /\/([A-Za-z0-9]+)\/([a-f0-9-]+)$/

interface Props {
  projectId: string
}

const mapStateToProps = (state: any): Partial<Props> => {
  return {
  }
}

const mapDispatchToProps = (): Partial<Props> => ({
})

async function init (projectId: string): Promise<any> { // auth: any,
  let lastTime = 0
  const world = new ECSYThreeWorld()
  world.registerSystem(GLTFLoaderSystem)
  .registerSystem(CameraSystem)
  .registerSystem(ImageSystem)
  const data = initialize(world)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { scene, camera, renderer } = data.entities
  const camera3d = camera.getObject3D()
  camera3d.position.z = 5
  document.onkeydown = (e) => {
    const camera3dObjectComponent = camera.getMutableComponent(Object3DComponent).value
    switch (e.keyCode) {
      case 37:
        camera3dObjectComponent.position.x -= 0.5
        break
      case 38:
        camera3dObjectComponent.position.z -= 0.5
        break
      case 39:
        (camera3dObjectComponent.position.x as number) += 0.5
        break
      case 40:
        (camera3dObjectComponent.position.z as number) += 0.5
        break
    }
  }
  const cameraComp = camera.getMutableComponent(Camera)
  cameraComp.far = 100000000000

  let service, serviceId
  const projectResult = await client.service('project').get(projectId)
  const projectUrl = projectResult.project_url
  const regexResult = projectUrl.match(projectRegex)
  if (regexResult) {
    service = regexResult[1]
    serviceId = regexResult[2]
  }
  const result = await client.service(service).get(serviceId)
  Object.keys(result.entities).forEach((key) => {
    const entity = result.entities[key]
    const newEntity = world.createEntity(entity.id)
    entity.components.forEach((component) => {
      console.log(component.name)
      console.log(component)
      SpokeNodeLoader(scene, newEntity, component)
    })
    console.log(newEntity)
  })
  console.log(world)
  const time = performance.now()
  const delta = time - lastTime
  world.execute(delta, time)
  lastTime = time
}

const SpokeRoomPage: React.FC = () => {
  const router = useRouter()
  const { projectId } = router.query
  const props = {
    projectId: projectId
  }

  useEffect(() => {
    const { projectId } = props
    init(projectId).catch((e) => { console.log(e) })
  }, [])

  if (!projectId) {
    return <Error404 />
  }
  return (
    <Layout pageTitle="Home">
      <div/>
    </Layout>
  )
}

export default SpokeRoomPage
