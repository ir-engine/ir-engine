import React from 'react';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/Alert';

export const PaymentFailurePage = () => {
    return (
      <Alert style={{ marginTop: 10, height: 200, justifyContent: 'center', alignItems: 'center' }} severity="error">
        <AlertTitle>Payment Failed</AlertTitle>
        Subscription — <strong>failed</strong>
      </Alert>
    );
}

export default PaymentFailurePage
