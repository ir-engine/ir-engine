import Layout from '../components/ui/Layout'
import React from 'react'
import AdminConsole from '../components/ui/Admin/Console'

export default class AdminPage extends React.Component {
  render() {
    return (
      <Layout pageTitle="Admin Console">
        {/* <Login /> */}
        <AdminConsole />
      </Layout>
    )
  }
}
