import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import FilterListIcon from '@mui/icons-material/FilterList'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

import { useAuthState } from '../../../user/services/AuthService'
import { useFetchUserRole } from '../../common/hooks/User.hooks'
import InputSelect from '../../common/InputSelect'
import Search from '../../common/Search'
import { UserRoleService, useUserRoleState } from '../../services/UserRoleService'
import { UserService } from '../../services/UserService'
import styles from '../../styles/admin.module.scss'
import UserModal from './CreateUser'
import UserTable from './UserTable'

interface InputSelectProps {
  value: string
  label: string
}

const Users = () => {
  const [search, setSearch] = useState('')
  const [userModalOpen, setUserModalOpen] = useState(false)
  const [role, setRole] = useState('')
  const { t } = useTranslation()
  const [checked, setChecked] = useState(false)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const openMenu = Boolean(anchorEl)
  const user = useAuthState().user
  const userRole = useUserRoleState()

  //Call custom hooks
  useFetchUserRole(UserRoleService, userRole, user)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const openModalCreate = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return
    }
    setUserModalOpen(open)
  }
  const closeViewModal = (open: boolean) => {
    setUserModalOpen(open)
  }
  const handleSkipGuests = (e: any) => {
    setChecked(e.target.checked)
    UserService.setSkipGuests(e.target.checked)
  }
  const handleChange = (e: any) => {
    setSearch(e.target.value)
  }

  const handleChangeRole = (e) => {
    UserService.setUserRole(e.target.value)
    setRole(e.target.value)
  }

  const resetFilter = () => {
    setChecked(false)
    setRole('')
    UserService.resetFilter()
  }

  const userRoleData: InputSelectProps[] = userRole.userRole.value.map((el) => {
    return {
      value: el.role,
      label: el.role
    }
  })

  return (
    <div>
      <Grid container spacing={1} className={styles.mb10px}>
        <Grid item sm={8} xs={12}>
          <Search text="user" handleChange={handleChange} />
        </Grid>
        <Grid item sm={3} xs={8}>
          <Button className={styles.openModalBtn} type="submit" variant="contained" onClick={openModalCreate(true)}>
            {t('admin:components.user.createNewUser')}
          </Button>
        </Grid>
        <Grid item sm={1} xs={4} style={{ display: 'flex', justifyContent: 'center' }}>
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            className={styles.filterButton}
            aria-controls={openMenu ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={openMenu ? 'true' : undefined}
          >
            <FilterListIcon color="info" fontSize="large" />
          </IconButton>
        </Grid>
      </Grid>
      <div className={styles.rootTable}>
        <UserTable search={search} />
      </div>
      <UserModal open={userModalOpen} handleClose={openModalCreate} closeViewModal={closeViewModal} />
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={openMenu}
        onClose={handleClose}
        classes={{ paper: styles.menuPaper }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem>
          <FormControlLabel
            className={styles.checkbox}
            control={
              <Checkbox
                onChange={(e) => handleSkipGuests(e)}
                name="stereoscopic"
                className={styles.checkbox}
                classes={{ checked: styles.checkedCheckbox }}
                color="primary"
                checked={checked}
              />
            }
            label={t('admin:components.user.hideGuests') as string}
          />
        </MenuItem>
        <Divider />
        <label className={styles.spanWhite} style={{ marginLeft: '1rem' }}>
          Based on user role
        </label>
        <MenuItem>
          <InputSelect
            handleInputChange={handleChangeRole}
            value={role}
            name="userRole"
            menu={userRoleData}
            formErrors={''}
          />
        </MenuItem>
        <MenuItem>
          <Button className={styles.gradientButton} onClick={() => resetFilter()}>
            <span className={styles.spanWhite}>Reset</span>
          </Button>
        </MenuItem>
      </Menu>
    </div>
  )
}

export default Users
