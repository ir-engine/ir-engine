import React, { useEffect, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { useStyles } from '../styles/ui'
import Button from '@mui/material/Button'
import InputSelect from './InputSelect'
import { UserRoleService, useUserRoleState } from '../services/UserRoleService'
import { useAuthState } from '../../user/services/AuthService'

interface Props {
  openDialog: boolean
  handleCloseDialog: () => void
  userAdmin: any
}

interface InputSelectProps {
  value: string
  label: string
}

export default function UserRoleDialog({ openDialog, handleCloseDialog, userAdmin }: Props) {
  const classes = useStyles()
  const [status, setStatus] = useState(userAdmin.userRole)

  const userRole = useUserRoleState()
  const user = useAuthState().user

  const userRoleData: InputSelectProps[] = []
  userRole.userRole.value.forEach((el) => {
    userRoleData.push({
      value: el.role,
      label: el.role
    })
  })

  const handleRoleChange = (e) => {
    setStatus(e.target.value)
  }

  //   useEffect(() => {
  //     setStatus(userAdmin.userRole)
  //   }, [userAdmin.userRole])

  useEffect(() => {
    const fetchData = async () => {
      await UserRoleService.fetchUserRole()
    }
    if (userRole.updateNeeded.value === true && user.id.value) fetchData()
  }, [userRole.updateNeeded.value, user.id.value])
  const patchUserRole = async (user: any, role: string) => {
    await UserRoleService.updateUserRole(user, role)
    handleCloseDialog()
  }

  const handleSubmitRole = async () => {
    await patchUserRole(userAdmin?.id, status)
    setStatus('')
    handleCloseDialog()
  }

  return (
    <Dialog
      open={openDialog}
      onClose={handleCloseDialog}
      aria-labelledby="form-dialog-title"
      classes={{ paper: classes.paperDialog }}
    >
      <DialogTitle id="form-dialog-title">Do you really want to change role for {userAdmin.name}? </DialogTitle>
      <DialogContent>
        <DialogContentText>
          In order to change role for {userAdmin.name} search from the list or select user role and submit.
        </DialogContentText>
        <InputSelect
          handleInputChange={handleRoleChange}
          value={status}
          name="User Role"
          menu={userRoleData}
          formErrors={[]}
        />
      </DialogContent>
      <DialogActions className={classes.marginTop}>
        <Button onClick={handleCloseDialog} className={classes.spanDange}>
          Cancel
        </Button>
        <Button onClick={handleSubmitRole} color="primary">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  )
}
