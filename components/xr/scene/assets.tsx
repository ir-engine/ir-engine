import React from 'react'
import DefaultAssets from './assets-default'
import ServerAssets from './assets-server'

export default class Assets extends React.Component {

  componentDidMount() {
  }

  render() {
    return (
      <a-assets>
        <DefaultAssets />
        <ServerAssets />
      </a-assets>
    )
  }
}
