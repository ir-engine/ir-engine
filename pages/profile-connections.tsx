import React from 'react'
import EmptyLayout from '../components/ui/Layout/EmptyLayout'
import ProfileConnections from '../components/ui/ProfileConnections/ProfileConnections'

export default class ProfileConnectionsPage extends React.Component {
  render() {
    return (
      <EmptyLayout>
        <ProfileConnections/>
      </EmptyLayout>
    )
  }
}
