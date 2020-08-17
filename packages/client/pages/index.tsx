import React from 'react'
import dynamic from 'next/dynamic'
const EcsComponent = dynamic(() => import('../components/ecs'))

export const IndexPage = (): any => {
  return <EcsComponent />
}

export default IndexPage
