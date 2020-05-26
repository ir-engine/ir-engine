import Layout from '../components/ui/Layout'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import Error404 from './404'
import capitalizeFirstLetter from '../utils/capitalizeFirstLetter'
const Scene = dynamic(() => import('../components/xr/scene/index'), { ssr: false })

export const ScenePage = () => {
  const router = useRouter()
  let { sceneName, ...query } = router.query
  // if path/contains/forward/slashes it passes an array, so just get the first item
  if (Array.isArray(sceneName)) {
    sceneName = sceneName[0]
  }
  console.log('sceneName in [sceneName].js', sceneName)
  const scenes = [
    {
      sceneName: 'dream'
    },
    {
      sceneName: 'dreamscene',
      queryProps: ['url'],
      pageTitle: 'DreamScene'
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
      sceneName: 'explore'
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
