import Layout from '../components/ui/Layout'
import dynamic from 'next/dynamic'
import React from 'react'
import Portal from '../components/xr/portal/Portal'
import PortalCursor from '../components/xr/portal/PortalCursor'
const SceneRoot = dynamic(() => import('../components/xr/scene'), {
  ssr: false
})

export default class PortalTestPage extends React.Component {
  render() {
    return (
      <Layout pageTitle="Portal test">
        <SceneRoot>
          <PortalCursor />
          <Portal href="/portals" position={{ x: 0, y: 1, z: -3 }} />
        </SceneRoot>
      </Layout>
    )
  }
}
