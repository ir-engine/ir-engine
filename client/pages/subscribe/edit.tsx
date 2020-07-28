import React from 'react'
import EmptyLayout from '../../components/ui/Layout/EmptyLayout'
import SeatList from '../../components/ui/Invite/SeatList'
import SubscribeStatus from '../../components/ui/Subscribe/index'

export const EditSubscribePage = (): any => {
  return (
    <EmptyLayout>
      <SubscribeStatus />
      <SeatList />
    </EmptyLayout>
  )
}

export default EditSubscribePage
