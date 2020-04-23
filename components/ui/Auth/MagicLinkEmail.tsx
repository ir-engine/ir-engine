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
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import NextLink from 'next/link'
import getConfig from 'next/config'

const config = getConfig().publicRuntimeConfig.staticPages
const authConfig = getConfig().publicRuntimeConfig.auth

interface Props {
  auth: any
  createMagicLink: typeof createMagicLink
}

class MagicLinkEmail extends React.Component<Props> {
  state = {
    email_phone: '',
    isSubmitted: false,
    isAgreedTermsOfService: false
  }

  handleInput = (e: any) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleCheck = (e: any) => {
    this.setState({
      [e.target.name]: e.target.checked
    })
  }

  handleSubmit = (e: any) => {
    e.preventDefault()

    this.props.createMagicLink(this.state.email_phone)
    this.setState({
      isSubmitted: true
    })
  }

  render() {
    const termsOfService = (config && config.termsOfService) ?? '/terms-of-service'
    const {isAgreedTermsOfService} = this.state

    let descr = "";
    let label = "";
    if (authConfig) {
      if (authConfig.isEnableSmsMagicLink && 
        authConfig.isEnableEmailMagicLink) {
        descr = "Please enter your email address or phone number and we'll send you a login link via Email or SMS. "
        label = "Email or Phone number"
      }
      else if (authConfig.isEnableSmsMagicLink) {
        descr = "Please enter your phone number and we'll send you a login link via SMS. "
        label = "Phone number"
      }
      else {
        descr = "Please enter your email address and we'll send you a login link via Email. "
        label = "Email address"
      }
    }
    else {
      descr = "Please enter your email address and we'll send you a login link via Email. "
      label = "Email address"
    }

    return (
        <Container component="main" maxWidth="xs">
          <div className={'paper'}>
            <Typography component="h1" variant="h5">
              Login Link
            </Typography>
    
            <Typography variant="body2" color="textSecondary" align="center">
              {descr}
            </Typography>
    
            <form className={'form'} noValidate onSubmit={(e) => this.handleSubmit(e)}>
              <Grid container>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="email_phone"
                    label={label}
                    name="email_phone"
                    autoComplete="email"
                    autoFocus
                    onChange={(e) => this.handleInput(e)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Checkbox value={true} onChange={e=>this.handleCheck(e)} color="primary" name="isAgreedTermsOfService"/>}
                    label={<div>I agree to the <NextLink href={termsOfService}>Terms & Conditions</NextLink></div>}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className="submit"
                    disabled={!isAgreedTermsOfService}
                  >
                    Send Login Link
                  </Button>
                </Grid>
              </Grid>
            </form>
          </div>
        </Container>
    );
  }
}

export default MagicLinkEmail