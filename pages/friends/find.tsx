import React from 'react'
import EmptyLayout from '../../components/ui/Layout/EmptyLayout'
import UserList from '../../components/ui/Friends/UserList'

export default class FirendsPage extends React.Component {
  render() {
    return (
      <EmptyLayout>
        <UserList/>
      </EmptyLayout>
    )
  }
}
