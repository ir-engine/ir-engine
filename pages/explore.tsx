import Layout from '../components/ui/Layout'
import dynamic from 'next/dynamic'

const Scene = dynamic(() => import('../components/xr/scene/explore'), {
  ssr: false
})

export const ExplorePage = () => {
  return (
    <Layout pageTitle="Home">
      <Scene />
    </Layout>
  )
}

export default ExplorePage
