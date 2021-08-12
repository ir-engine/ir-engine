import React, { useEffect } from 'react'
import Backdrop from '@material-ui/core/Backdrop'
import Button from '@material-ui/core/Button'
import Fade from '@material-ui/core/Fade'
import FormGroup from '@material-ui/core/FormGroup'
import Modal from '@material-ui/core/Modal'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import classNames from 'classnames'
import styles from '../Admin.module.scss'
import { sendInvite } from '../../../social/reducers/invite/service'
import { retrieveInvites } from '../../../social/reducers/inviteType/service'
import { selectInviteState } from '../../../social/reducers/invite/selector'
import { selectInviteTypesState } from '../../../social/reducers/inviteType/selector'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { Dropdown } from 'semantic-ui-react'
import Snackbar from '@material-ui/core/Snackbar'
import _ from 'lodash'
import Grid from '@material-ui/core/Grid'
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import { useHistory } from 'react-router-dom'

interface Props {
  open: boolean
  handleClose: any
  sendInvite?: any
  retrieveInvites?: any
  inviteTypeData?: any
  users: any
}

const mapStateToProps = (state: any): any => {
  return {
    receivedInvites: selectInviteState(state),
    sentInvites: selectInviteState(state),
    inviteTypeData: selectInviteTypesState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  sendInvite: bindActionCreators(sendInvite, dispatch),
  retrieveInvites: bindActionCreators(retrieveInvites, dispatch)
})

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />
}

const inviteCodeRegex = /^[0-9a-fA-F]{8}$/
const emailRegex =
  /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
const phoneRegex = /^[0-9]{10}$/
/**
 * Dev comment: => I don't know use of Token in the form field
 * @param props
 */
const InviteModel = (props: Props) => {
  const { open, handleClose, sendInvite, retrieveInvites, inviteTypeData, users } = props

  const router = useHistory()
  const [currency, setCurrency] = React.useState('friend')
  const inviteType = inviteTypeData.get('inviteTypeData').get('inviteType')
  const [targetUser, setTargetUser] = React.useState('')
  const [token, setToken] = React.useState('')
  const [passcode, setPasscode] = React.useState('')
  const [warning, setWarning] = React.useState('')
  const [openSnabar, setOpenSnabar] = React.useState(false)
  const [providerType, setProviderType] = React.useState('email')
  const currencies = []
  const provide = [
    {
      value: 'email',
      label: 'E-mail'
    },
    {
      value: 'sms',
      label: 'SMS'
    }
  ]
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrency(event.target.value)
  }

  const refreshData = () => {
    router.go(0)
  }

  const handleChangeType = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProviderType(event.target.value)
  }
  useEffect(() => {
    ValidatorForm.addValidationRule('isEmail', (value) => {
      switch (providerType) {
        case 'email':
          if (emailRegex.test(value) !== true) {
            return false
          }
          break
        case 'sms':
          if (phoneRegex.test(value) !== true) {
            return false
          }
          break
      }

      return true
    })

    ValidatorForm.addValidationRule('isPasscode', (value) => {
      if (value) {
        if (inviteCodeRegex.test(value) !== true) {
          return false
        }
      }
      return true
    })

    return () => {
      ValidatorForm.removeValidationRule('isEmail')
      ValidatorForm.removeValidationRule('isPasscode')
    }
  }, [providerType])

  const createInvite = async () => {
    const data = {
      type: currency,
      token: token, // phone number (10 digital us number) or email
      inviteCode: passcode || null, // Code should range from 0-9 and a-f as well as A-F match to 8 characters
      invitee: targetUser[0], // valid user id
      identityProviderType: providerType, // email or sms
      targetObjectId: targetUser[0]
    }
    if (token && currency && targetUser) {
      await sendInvite(data)
      refreshData()
      handleClose()
    } else {
      setOpenSnabar(true)
      setWarning('Please fill all required fields!')
    }
  }

  if (inviteType) {
    inviteType.forEach((el) => {
      currencies.push({
        value: el.type,
        label: el.type
      })
    })
  }

  const stateOptions = []
  users.forEach((el) => {
    stateOptions.push({
      key: el.id,
      text: el.name,
      value: el.id
    })
  })

  useEffect(() => {
    const fetchData = async () => {
      await retrieveInvites()
    }
    fetchData()
  }, [])

  const onSelectValue = (e, data) => {
    setTargetUser(data.value)
  }

  const handleInputChange = (e) => {
    const value = e.target.value.trim()
  }

  const handleCloseSnabar = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }

    setOpenSnabar(false)
  }

  return (
    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={styles.modal}
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500
        }}
      >
        <Fade in={props.open}>
          <div
            className={classNames({
              [styles.paper]: true,
              [styles['modal-content']]: true
            })}
          >
            <Typography variant="h5" align="center" className="mt-4 mb-4" component="h4">
              Send Invite
            </Typography>
            <Dropdown
              placeholder="Users"
              fluid
              multiple
              search
              selection
              onChange={onSelectValue}
              onSearchChange={handleInputChange}
              options={stateOptions}
            />
            <ValidatorForm onSubmit={createInvite}>
              <Grid container spacing={3}>
                <Grid item xs={5}>
                  <TextValidator
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    id="passcode"
                    label="Enter valid Passcode or None"
                    name="passcode"
                    value={passcode}
                    validators={['isPasscode']}
                    errorMessages={['Invalid Invite Code']}
                    onChange={(e) => setPasscode(e.target.value)}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    id="outlined-select-currency-native"
                    select
                    label="Target type"
                    value={currency}
                    onChange={handleChange}
                    SelectProps={{
                      native: true
                    }}
                    fullWidth
                    margin="normal"
                    required
                    variant="outlined"
                  >
                    {currencies.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    id="outlined-select-currency-native"
                    select
                    label="Identity provider  type"
                    value={providerType}
                    onChange={handleChangeType}
                    SelectProps={{
                      native: true
                    }}
                    fullWidth
                    margin="normal"
                    required
                    variant="outlined"
                  >
                    {provide.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </TextField>
                </Grid>
              </Grid>

              <TextValidator
                variant="outlined"
                margin="normal"
                fullWidth
                id="maxUsers"
                label="Please enter US phone number or E-mail"
                name="token"
                required
                className="mb-4"
                value={token}
                validators={['isEmail', 'required']}
                errorMessages={['E-mail is invaid or Phone number must be 10 digital', 'this field is required']}
                onChange={(e) => setToken(e.target.value)}
              />
              <FormGroup row className={styles.locationModalButtons}>
                {' '}
                <Button type="submit" variant="contained" color="primary">
                  Send Invitation
                </Button>
                <Button type="submit" variant="contained" onClick={handleClose}>
                  Cancel
                </Button>
              </FormGroup>
            </ValidatorForm>
          </div>
        </Fade>
      </Modal>
      <Snackbar
        open={openSnabar}
        autoHideDuration={6000}
        onClose={handleCloseSnabar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnabar} severity="warning">
          {warning}
        </Alert>
      </Snackbar>
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(InviteModel)
