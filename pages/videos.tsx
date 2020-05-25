import Layout from '../components/ui/Layout'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

const Scene = dynamic(() => import('../components/xr/scene/index'), { ssr: false })

export const VideoPage = () => {
  const router = useRouter()
  const manifest = router.query.manifest as string
  const title = router.query.title as string
  const format = router.query.format as string
  return (
    <Layout pageTitle="Home">
      <Scene startingScene='video'
        manifest={manifest}
        title={title}
        format={format}/>
    </Layout>
  )
}

export default VideoPage
