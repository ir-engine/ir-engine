import React from 'react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
import {
  createMagicLink,
} from '../../../redux/auth/service'
import Grid from '@material-ui/core/Grid'
import './auth.scss'

interface Props {
  auth: any
  createMagicLink: typeof createMagicLink
};

class MagicLinkSms extends React.Component<Props> {
  state = {
    email: '',
    isSubmitted: false
  }

  handleInput = (e: any) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleSubmit = (e: any) => {
    e.preventDefault();

    this.props.createMagicLink('sms', this.state.email);
    this.setState({
      isSubmitted: true
    });
  }

  render() {
    return (
        <Container component="main" maxWidth="xs">
          <div className={'paper'}>
            <Typography component="h1" variant="h5">
              SMS Login Link
            </Typography>
    
            <Typography variant="body2" color="textSecondary" align="center">
              Please enter your phone number and we'll send you a sms login link.
            </Typography>
    
            <form className={'form'} noValidate onSubmit={(e) => this.handleSubmit(e)}>
              <Grid container>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="mobile"
                    label="Phone Number"
                    name="mobile"
                    autoComplete="phone"
                    autoFocus
                    onChange={(e) => this.handleInput(e)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={'submit'}
                  >
                    SMS Login Link
                  </Button>
                </Grid>
              </Grid>
            </form>
          </div>
        </Container>
    );
  }
}

export default MagicLinkSms;