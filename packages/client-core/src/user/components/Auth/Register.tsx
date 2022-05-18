import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { AuthService } from '../../services/AuthService'
import React, { useState } from 'react'
import { useDispatch } from '../../../store'
import styles from './Auth.module.scss'
import { useTranslation } from 'react-i18next'

interface Props {}

const SignUp = (props: Props): any => {
  const dispatch = useDispatch()
  const initialState = {
    email: '',
    password: '',
    phone: ''
  }
  const [state, setState] = useState(initialState)
  const { t } = useTranslation()

  const handleInput = (e: any): void => {
    e.preventDefault()
    setState({ ...state, [e.target.name]: e.target.value })
  }

  const handleRegister = (e: any): void => {
    e.preventDefault()
    dispatch(
      AuthService.registerUserByEmail({
        email: state.email,
        password: state.password
      })
    )
  }

  return (
    <Container component="main" maxWidth="xs">
      <div className={styles.paper}>
        <Avatar className={styles.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          {t('user:auth.register.header')}
        </Typography>
        <form className={styles.form} noValidate onSubmit={(e) => handleRegister(e)}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="email"
                label={t('user:auth.register.lbl-email')}
                name="email"
                autoComplete="email"
                onChange={(e) => handleInput(e)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="password"
                label={t('user:auth.register.lbl-password')}
                type="password"
                id="password"
                autoComplete="current-password"
                onChange={(e) => handleInput(e)}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" fullWidth variant="contained" color="primary" className={styles.submit}>
                {t('user:auth.register.lbl-signup')}
              </Button>
            </Grid>
          </Grid>
          {/*<Grid container justify="flex-end">*/}
          {/*<Grid item>*/}
          {/*<Link*/}
          {/*href="#"*/}
          {/*variant="body2"*/}
          {/*onClick={() =>*/}
          {/*showDialog({*/}
          {/*children: <SignIn />*/}
          {/*})*/}
          {/*}*/}
          {/*>*/}
          {/*Already have an account? Sign in*/}
          {/*</Link>*/}
          {/*</Grid>*/}
          {/*</Grid>*/}
        </form>
      </div>
    </Container>
  )
}

const SignUpWrapper = (props: any): any => <SignUp {...props} />

export default SignUpWrapper
