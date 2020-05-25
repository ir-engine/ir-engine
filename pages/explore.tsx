import Layout from '../components/ui/Layout'
import dynamic from 'next/dynamic'
const Scene = dynamic(() => import('../components/xr/scene/index'), { ssr: false })

export const ExplorePage = () => {
  return (
    <Layout pageTitle="Home">
      <Scene startingScene='explore'/>
    </Layout>
  )
}

export default ExplorePage
