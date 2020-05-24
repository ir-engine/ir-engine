import React from 'react'
import EmptyLayout from '../../components/ui/Layout/EmptyLayout'
import SeatList from '../../components/ui/Invite/SeatList'

export default class InvitePage extends React.Component {
  render() {
    return (
      <EmptyLayout>
        <SeatList/>
      </EmptyLayout>
    )
  }
}
