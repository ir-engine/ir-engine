import React from 'react'
import { Alert, AlertTitle } from '@material-ui/lab'

export default class PaymentFailurePage extends React.Component {
  render() {
    return (
      <Alert style={{ marginTop: 10, height: 200, justifyContent: 'center', alignItems: 'center' }} severity="error">
        <AlertTitle>Payment Failed</AlertTitle>
        Subscription — <strong>failed</strong>
      </Alert>
    )
  }
}
