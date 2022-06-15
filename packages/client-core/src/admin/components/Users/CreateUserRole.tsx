import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import DialogContent from '@mui/material/DialogContent'

import CreateModal from '../../common/CreateModal'
import InputText from '../../common/InputText'

interface Props {
  open: boolean
  handleClose: () => void
}

const createUser = ({ open, handleClose }: Props) => {
  const [role, setRole] = useState('')
  const { t } = useTranslation()

  const createUserRole = async () => {
    setRole('')
  }

  const handleChange = (e) => {
    setRole(e.target.value)
  }

  return (
    <CreateModal
      open={open}
      handleClose={handleClose}
      text={t('admin:components.user.userRole')}
      action="Create"
      submit={createUserRole}
    >
      <DialogContent>
        <InputText name="role" label={t('admin:components.user.role')} value={role} onChange={handleChange} />
      </DialogContent>
    </CreateModal>
  )
}

export default createUser
