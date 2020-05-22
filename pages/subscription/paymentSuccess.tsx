import React from 'react'
import { Alert, AlertTitle } from '@material-ui/lab'

export default class PaymentSuccessPage extends React.Component {
  render() {
    return (
      <Alert style={{ marginTop: 10, height: 200, justifyContent: 'center', alignItems: 'center' }} severity="success">
        <AlertTitle>Payment Successful</AlertTitle>
        Subscription — <strong>successful</strong>
      </Alert>
    )
  }
}
