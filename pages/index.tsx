import Layout from '../components/ui/Layout'
import dynamic from 'next/dynamic'
const Scene = dynamic(() => import('../components/xr/scene/landing'), {
  ssr: false
})

export const IndexPage = () => {
  return (
    <Layout pageTitle="Home">
      <Scene />
    </Layout>
  )
}

export default IndexPage
