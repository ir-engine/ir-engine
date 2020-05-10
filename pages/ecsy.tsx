import React from 'react'
import dynamic from 'next/dynamic'
const EcsyPage = dynamic(() => import('../components/xr/ecsy'), {
  ssr: false
})

export default class EcsyWrapper extends React.Component {
  render() {
    return <EcsyPage />
  }
}
