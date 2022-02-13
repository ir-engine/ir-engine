import DialogContent from '@mui/material/DialogContent'
import React from 'react'
import CreateModel from '../../common/CreateModel'
import InputText from '../../common/InputText'

interface Props {
  open: boolean
  handleClose: any
}

const createUser = (props: Props) => {
  const { open, handleClose } = props
  const [role, setRole] = React.useState('')
  const createUserRole = async () => {
    setRole('')
  }

  const handleChange = (e) => {
    setRole(e.target.value)
  }

  return (
    <CreateModel open={open} handleClose={handleClose} text="user role" action="Create" submit={createUserRole}>
      <DialogContent>
        <InputText value={role} formErrors={[]} handleInputChange={handleChange} name="role" />
      </DialogContent>
    </CreateModel>
  )
}

export default createUser
