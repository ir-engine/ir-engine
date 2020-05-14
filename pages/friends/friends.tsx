import React from 'react'
import EmptyLayout from '../../components/ui/Layout/EmptyLayout'
import MyFriends from '../../components/ui/Friends/MyFriends'

export default class FirendsPage extends React.Component {
  render() {
    return (
      <EmptyLayout>
        <MyFriends/>
      </EmptyLayout>
    )
  }
}
