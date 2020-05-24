import Layout from '../components/ui/Layout'
import dynamic from 'next/dynamic'
import Portal from '../components/xr/portal/Portal'
import PortalCursor from '../components/xr/portal/PortalCursor'
const SceneRoot = dynamic(() => import('../components/xr/scene'), {
  ssr: false
})

export const PortalsPage = () => {
  return (
    <Layout pageTitle="Portals">
      <SceneRoot>
        <PortalCursor />
        <Portal href="/" position={{ x: -6, y: 1, z: -5 }} />
        <Portal href="/portaltest" position={{ x: -2, y: 1, z: -6 }} />
        <Portal
          href="https://vrland.io/dome/in"
          position={{ x: 2, y: 1, z: -6 }}
        />
        <Portal
          href="https://hubs.mozilla.com/eyUQKmn/welcome-ultimate-festivity"
          position={{ x: 6, y: 1, z: -4 }}
        />
      </SceneRoot>
    </Layout>
  )
}

export default PortalsPage
