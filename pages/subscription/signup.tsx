import React from 'react'
import Layout from '../../components/ui/Layout'
import dynamic from 'next/dynamic'
const Signup = dynamic(() => import('../../components/ui/Pricing'), { ssr: false })

export default class PricingPage extends React.Component {
  render() {
    return (
      <Layout pageTitle="Pricing">
        <Signup />
      </Layout>
    )
  }
}
