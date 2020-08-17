import React from 'react'
import dynamic from 'next/dynamic'
const EcsComponent = dynamic(() => import('@xr3ngine/engine'))

export const IndexPage = (): any => {
  return <EcsComponent />
}

export default IndexPage
