import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import FilterListIcon from '@mui/icons-material/FilterList'
import Avatar from '@mui/material/Avatar'
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
import { userFilterMenu } from '../../common/variables/user'
import { UserRoleService, useUserRoleState } from '../../services/UserRoleService'
import { UserService } from '../../services/UserService'
import adminStyles from '../../styles/admin.module.scss'
import { useStyles } from '../../styles/ui'
import styles from '../Admin.module.scss'
import UserModel from './CreateUser'
import UserTable from './UserTable'

interface InputSelectProps {
  value: string
  label: string
}

const Users = () => {
  const classes = useStyles()
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
  const closeViewModel = (open: boolean) => {
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
      <Grid container spacing={1} className={classes.marginBottom}>
        <Grid item md={8} xs={6}>
          <Search text="user" handleChange={handleChange} />
        </Grid>
        <Grid item md={3} xs={5}>
          <Button
            className={adminStyles.openModalBtn}
            type="submit"
            variant="contained"
            onClick={openModalCreate(true)}
          >
            {t('admin:components.user.createNewUser')}
          </Button>
        </Grid>
        <Grid item md={1} xs={1} style={{ display: 'flex', justifyContent: 'center' }}>
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={openMenu ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={openMenu ? 'true' : undefined}
          >
            <FilterListIcon color="info" fontSize="large" />
          </IconButton>
        </Grid>
      </Grid>
      <div className={classes.rootTable}>
        <UserTable search={search} />
      </div>
      <UserModel open={userModalOpen} handleClose={openModalCreate} closeViewModel={closeViewModel} />
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={openMenu}
        onClose={handleClose}
        // onClick={handleClose}
        PaperProps={userFilterMenu}
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
                color="primary"
                checked={checked}
              />
            }
            label={t('admin:components.user.hideGuests') as string}
          />
        </MenuItem>
        <Divider />
        <label className={classes.spanWhite} style={{ marginLeft: '1rem' }}>
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
          <IconButton onClick={() => resetFilter()}>
            <span className={classes.spanWhite}>Reset</span>
          </IconButton>
        </MenuItem>
      </Menu>
    </div>
  )
}

export default Users