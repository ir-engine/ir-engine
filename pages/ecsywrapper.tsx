import React from 'react'
import dynamic from 'next/dynamic'
// eslint-disable-next-line no-unused-vars
const EcsyPage = dynamic(() => import('./ecsy'), {
  ssr: false
})

export default class EcsyWrapper extends React.Component {
  render() {
    return <EcsyPage />
  }
}
