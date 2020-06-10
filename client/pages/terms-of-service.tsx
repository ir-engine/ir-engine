import Layout from '../components/ui/Layout'
import dynamic from 'next/dynamic'
const Scene = dynamic(() => import('../components/xr/scene'), { ssr: false })
// TODO: Make a TOS page

export const TermsOfServicePage = () => {
  return (
    <Layout pageTitle="Home">
      {/* <Login /> */}
      <Scene />
    </Layout>
  )
}

export default TermsOfServicePage
