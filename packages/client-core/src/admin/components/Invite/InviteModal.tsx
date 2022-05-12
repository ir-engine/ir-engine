import classNames from 'classnames'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator'
import { useHistory } from 'react-router-dom'
import { Dropdown } from 'semantic-ui-react'

import { User } from '@xrengine/common/src/interfaces/User'

import MuiAlert, { AlertProps } from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Fade from '@mui/material/Fade'
import FormGroup from '@mui/material/FormGroup'
import Grid from '@mui/material/Grid'
import Modal from '@mui/material/Modal'
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { InviteService } from '../../../social/services/InviteService'
import { InviteTypeService } from '../../../social/services/InviteTypeService'
import { useInviteTypeState } from '../../../social/services/InviteTypeService'
import styles from '../../styles/admin.module.scss'

interface Props {
  open: boolean
  handleClose: () => void
  users: User[]
}

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

const InviteModal = (props: Props) => {
  const { open, handleClose, users } = props
  const router = useHistory()
  const [currency, setCurrency] = React.useState('friend')
  const inviteTypeData = useInviteTypeState()
  const inviteType = inviteTypeData.inviteTypeData.invitesType?.value
  const [targetUser, setTargetUser] = React.useState('')
  const [token, setToken] = React.useState('')
  const [passcode, setPasscode] = React.useState('')
  const [warning, setWarning] = React.useState('')
  const [openSnabar, setOpenSnabar] = React.useState(false)
  const [providerType, setProviderType] = React.useState('email')
  // const [openInvite ,setOpenInvite] = React.useState(false);
  const { t } = useTranslation()

  interface Currency {
    value: string
    label: string
  }

  const currencies: Currency[] = []

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
          if (!emailRegex.test(value)) {
            return false
          }
          break
        case 'sms':
          if (!phoneRegex.test(value)) {
            return false
          }
          break
      }

      return true
    })

    ValidatorForm.addValidationRule('isPasscode', (value) => {
      if (value) {
        if (!inviteCodeRegex.test(value)) {
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
      await InviteService.sendInvite(data)
      refreshData()
      handleClose()
    } else {
      setOpenSnabar(true)
      setWarning(t('admin:components.invite.fillAllRequiredFields'))
    }
  }

  if (inviteType != null) {
    inviteType.forEach((el) => {
      currencies.push({
        value: el.type,
        label: el.type
      })
    })
  }

  interface StateOption {
    key: string
    text: string
    value: string
  }

  const stateOptions: StateOption[] = []
  users.forEach((el) => {
    stateOptions.push({
      key: el.id ?? '',
      text: el.name,
      value: el.id ?? ''
    })
  })

  useEffect(() => {
    const fetchData = async () => {
      await InviteTypeService.retrieveInvites()
    }
    fetchData()
  }, [])

  const onSelectValue = (e, data) => {
    setTargetUser(data.value)
  }

  const handleInputChange = (e) => {}

  const handleCloseSnabar = (event: React.SyntheticEvent, reason?: SnackbarCloseReason) => {
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
      >
        <Fade in={props.open} style={{ backgroundColor: '#343b41' }}>
          <div
            className={classNames({
              [styles.paper]: true,
              [styles.modaContent]: true
            })}
          >
            <Typography variant="h5" align="center" className="mt-4 mb-4" component="h4">
              {t('admin:components.invite.sendInvite')}
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
                    label={t('admin:components.invite.enterValidPasscode')}
                    name="passcode"
                    value={passcode}
                    validators={['isPasscode']}
                    errorMessages={[t('admin:components.invite.invalidInviteCode')]}
                    onChange={(e) => setPasscode(e.target.value)}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    id="outlined-select-currency-native"
                    select
                    label={t('admin:components.invite.targetType')}
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
                    {currencies.map((option, index) => (
                      <option key={option.value + index} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    id="outlined-select-currency-native"
                    select
                    label={t('admin:components.invite.identityProviderType')}
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
                    {provide.map((option, element) => (
                      <option key={option.value + element} value={option.value}>
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
                label={t('admin:components.invite.enterPhoneOrEmail')}
                name="token"
                required
                className="mb-4"
                value={token}
                validators={['isEmail', 'required']}
                errorMessages={['E-mail is invaid or Phone number must be 10 digital', 'this field is required']}
                onChange={(e) => setToken(e.target.value)}
              />
              <FormGroup row className={styles.locationModalButtons}>
                <Button type="submit" variant="contained" className={styles.submitButton}>
                  {t('admin:components.invite.sendInvitation')}
                </Button>
                <Button type="submit" variant="contained" className={styles.cancelButton} onClick={handleClose}>
                  {t('admin:components.invite.cancel')}
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

    // <Drawer classes={{paper:styles.paper}} anchor="right" open={open} onClose={handleClose()}>
    //   <Container maxWidth="sm" className={classtylesses.mt20}>
    //     <DialogTitle id="form-dialog-title" className={styles.textAlign}>
    //      Send Invite
    //     </DialogTitle>
    //     <Paper component="div" className={styles.createInput}>
    //     <Dropdown
    //         placeholder="Users"
    //         fluid
    //         multiple
    //         search
    //         selection
    //         onChange={onSelectValue}
    //         onSearchChange={handleInputChange}
    //         options={stateOptions}
    //       />
    //     </Paper>
    //     <Grid container spacing={3}>
    //     <Grid item xs={5}>
    //       <label>Enter valid Passcode or None</label>
    //      <Paper component="div" className={styles.createInput}>
    //      <InputBase
    //       className={styles.input}
    //       name="passcode"
    //       placeholder="Enter valid Passcode or None"
    //       autoComplete="off"
    //       value={passcode}
    //       onChange={(e) => setPasscode(e.target.value)}
    //      />
    //      </Paper>
    //     </Grid>
    //     <Grid item xs={4}>
    //       <label>Target type</label>
    //       <Paper component="div" className={styles.createInput}>
    //       <FormControl fullWidth>
    //       <Select
    //         labelId="demo-controlled-open-select-label"
    //         id="demo-controlled-open-select"
    //         value={currency}
    //         fullWidth
    //         displayEmpty
    //         // name="avatar"
    //         onChange={handleChange}
    //         className={styles.select}
    //         MenuProps={{ classes: { paper: styles.selectPaper } }}
    //       >
    //        <MenuItem value="" disabled>
    //        <em>friend</em>
    //        </MenuItem>
    //         {currencies.map((option) => (
    //                 <MenuItem key={option.value} value={option.value}>
    //                   {option.label}
    //                 </MenuItem>
    //               ))}
    //       </Select>
    //       </FormControl>
    //       </Paper>
    //     </Grid>
    //     <Grid item xs={3}>
    //     <label>Identity provider  type</label>
    //       <Paper component="div" className={styles.createInput}>
    //       <FormControl fullWidth>
    //       <Select
    //         labelId="demo-controlled-open-select-label"
    //         id="demo-controlled-open-select"
    //         value={providerType}
    //         fullWidth
    //         displayEmpty
    //         // name="avatar"
    //         onChange={handleChangeType}
    //         className={styles.select}
    //         MenuProps={{ classes: { paper: styles.selectPaper } }}
    //       >
    //        <MenuItem value="" disabled>
    //        <em>E-mail</em>
    //        </MenuItem>
    //         {provide.map((option) => (
    //                 <MenuItem key={option.value} value={option.value}>
    //                   {option.label}
    //                 </MenuItem>
    //               ))}
    //       </Select>
    //       </FormControl>
    //       </Paper>

    //     </Grid>
    //     </Grid>
    //     <label>Please enter US phone number or E-mail</label>
    //      <Paper component="div" className={styles.createInput}>
    //      <InputBase
    //       className={styles.input}
    //       name="token"
    //       placeholder="Please enter US phone number or E-mail"
    //       autoComplete="off"
    //       value={token}
    //       onChange={(e) => setToken(e.target.value)}
    //      />
    //      </Paper>

    //      <FormGroup row className={styles.locationModalButtons}>
    //           <Button type="submit" variant="contained" className={styles.submitButton}>
    //             Send Invitation
    //           </Button>
    //           <Button type="submit" variant="contained" className={styles.cancelButton} onClick={handleClose}>
    //             Cancel
    //           </Button>
    //         </FormGroup>

    //   </Container>
    // </Drawer>
  )
}

export default InviteModal
