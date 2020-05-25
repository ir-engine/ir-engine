import Layout from '../components/ui/Layout'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

const Scene = dynamic(() => import('../components/xr/scene/index'), { ssr: false })

export const VideoPage = () => {
  const router = useRouter()
  const url = router.query.url as string
  return (
    <Layout pageTitle="Home">
      <Scene startingScene='dreamscene'
        dreamUrl={url}/>
    </Layout>
  )
}

export default VideoPage
