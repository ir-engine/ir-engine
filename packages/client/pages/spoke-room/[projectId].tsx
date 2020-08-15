import Layout from '../../components/ui/Layout'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import Error404 from '../404'
import React from 'react'

const SpokeRoom = dynamic(() => import('../../components/xr/scene/spoke-scene'), {
  ssr: false
})

const SpokeRoomPage: React.FC = () => {
  const router = useRouter()
  const { projectId } = router.query
  const props = {
    projectId: projectId
  }
  if (!projectId) {
    return <Error404 />
  }
  return (
    <Layout pageTitle="Home">
      <SpokeRoom {...props}/>
    </Layout>
  )
}

export default SpokeRoomPage
