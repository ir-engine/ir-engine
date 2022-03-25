import React, { useState } from 'react'

import DialogContent from '@mui/material/DialogContent'

import CreateModal from '../../common/CreateModal'
import InputText from '../../common/InputText'

interface Props {
  open: boolean
  handleClose: () => void
}

const createUser = (props: Props) => {
  const { open, handleClose } = props
  const [role, setRole] = useState('')
  const createUserRole = async () => {
    setRole('')
  }

  const handleChange = (e) => {
    setRole(e.target.value)
  }

  return (
    <CreateModal open={open} handleClose={handleClose} text="user role" action="Create" submit={createUserRole}>
      <DialogContent>
        <InputText value={role} formErrors={''} handleInputChange={handleChange} name="role" />
      </DialogContent>
    </CreateModal>
  )
}

export default createUser
