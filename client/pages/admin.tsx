/* eslint-disable react/prefer-stateless-function */
import EmptyLayout from '../components/ui/Layout/EmptyLayout'
import React from 'react'
import AdminConsole from '../components/ui/Admin/Console'

export default class AdminPage extends React.Component {
  render() {
    return (
      <EmptyLayout>
        {/* <Login /> */}
        <AdminConsole />
      </EmptyLayout>
    )
  }
}
