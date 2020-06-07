import Layout from '../components/ui/Layout'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import Error404 from './404'
import capitalizeFirstLetter from '../utils/capitalizeFirstLetter'
import getConfig from 'next/config'
const config = getConfig().publicRuntimeConfig.xr

const Scene = dynamic(() => import('../components/xr/scene/index'), { ssr: false })

export const ScenePage = () => {
  const router = useRouter()
  let { sceneName, ...query } = router.query
  // if path/contains/forward/slashes it passes an array, so just get the first item
  if (Array.isArray(sceneName)) {
    sceneName = sceneName[0]
  }
  const scenes = [
    {
      sceneName: config.vrRoomGrid.name
    },
    {
      sceneName: config.vrRoomGrid.name + '-scene',
      queryProps: ['url'],
      pageTitle: capitalizeFirstLetter(config.vrRoomGrid.name) + ' Scene'
    },
    {
      sceneName: 'video',
      queryProps: ['manifest', 'title', 'format']
    },
    {
      sceneName: 'video360',
      queryProps: ['manifest', 'title', 'format']
    },
    {
      sceneName: config.videoGrid.name
    }]
  const scene = scenes.find(scene => scene.sceneName === sceneName)
  // if page doesn't exist (as defined in above array) send to 404 page.
  if (!scene) {
    return <Error404 />
  }
  const pageTitle = scene.pageTitle || capitalizeFirstLetter(sceneName)
  // get query props and pass to scene component
  const queryProps = scene.queryProps || []
  const props = {}
  for (const prop of queryProps) {
    props[prop] = query[prop]
  }
  return (
    <Layout pageTitle={pageTitle}>
      <Scene sceneName={sceneName} {...props} />
    </Layout>
  )
}

export default ScenePage
