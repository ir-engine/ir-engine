import React from 'react'
import dynamic from 'next/dynamic'
// eslint-disable-next-line no-unused-vars
const EcsyPage = dynamic(() => import('../components/xr/scene/Ecsy'), { ssr: false })

export const EcsyWrapper = (): any => <EcsyPage />

export default EcsyWrapper
