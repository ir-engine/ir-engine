import React from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import {
  verifyEmail,
} from '../../../redux/auth/service'
import './auth.scss'
import EmptyLayout from '../Layout/EmptyLayout';

interface Props {
  auth: any,
  type: string,
  token: string,
  verifyEmail: typeof verifyEmail
};

class VerifyEmail extends React.Component<Props> {
  state = {
    email: ''
  };

  componentDidMount() {
    this.props.verifyEmail(this.props.token);
  }

  render() {
    return (
      <EmptyLayout>
        <Container component="main" maxWidth="md">
          <div className={'paper'}>
            <Typography component="h1" variant="h5">
            Verify Email
            </Typography>

            <Box mt={3}>
              <Typography variant="body2" color="textSecondary" align="center">
                Please wait a moment while processing...
              </Typography>
            </Box>
          </div>
        </Container>
      </EmptyLayout>
    );
  }
}

export default VerifyEmail;
