import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import FilterListIcon from '@mui/icons-material/FilterList'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'

import { useAuthState } from '../../../user/services/AuthService'
import InputSelect, { InputMenuItem } from '../../common/InputSelect'
import Search from '../../common/Search'
import { AdminUserRoleService, useAdminUserRoleState } from '../../services/UserRoleService'
import { AdminUserService } from '../../services/UserService'
import styles from '../../styles/admin.module.scss'
import UserDrawer, { UserDrawerMode } from './UserDrawer'
import UserTable from './UserTable'

const Users = () => {
  const [search, setSearch] = useState('')
  const [openUserDrawer, setOpenUserDrawer] = useState(false)
  const [role, setRole] = useState('')
  const { t } = useTranslation()
  const [checked, setChecked] = useState(false)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const openMenu = Boolean(anchorEl)
  const user = useAuthState().user
  const userRole = useAdminUserRoleState()

  useEffect(() => {
    const fetchData = async () => {
      AdminUserRoleService.fetchUserRole()
    }
    const role = userRole ? userRole.updateNeeded.value : false
    if (role && user.id.value) fetchData()
  }, [userRole.updateNeeded.value, user.value])

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleSkipGuests = (e: any) => {
    setChecked(e.target.checked)
    AdminUserService.setSkipGuests(e.target.checked)
  }
  const handleChange = (e: any) => {
    setSearch(e.target.value)
  }

  const handleChangeRole = (e) => {
    AdminUserService.setUserRole(e.target.value)
    setRole(e.target.value)
  }

  const resetFilter = () => {
    setChecked(false)
    setRole('')
    AdminUserService.resetFilter()
  }

  const userRoleData: InputMenuItem[] = userRole.userRole.value.map((el) => {
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
        <Grid item sm={4} xs={8}>
          <Box sx={{ display: 'flex' }}>
            <Button
              sx={{ flexGrow: 1 }}
              className={styles.openModalBtn}
              type="submit"
              variant="contained"
              onClick={() => setOpenUserDrawer(true)}
            >
              {t('admin:components.user.createUser')}
            </Button>
            <IconButton
              onClick={handleClick}
              size="small"
              sx={{ ml: 1 }}
              className={styles.filterButton}
              aria-controls={openMenu ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={openMenu ? 'true' : undefined}
            >
              <FilterListIcon color="info" fontSize="large" />
            </IconButton>
          </Box>
        </Grid>
      </Grid>
      <UserTable className={styles.rootTable} search={search} />
      <UserDrawer open={openUserDrawer} mode={UserDrawerMode.Create} onClose={() => setOpenUserDrawer(false)} />
      <Popover
        classes={{ paper: styles.popover }}
        open={openMenu}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <InputSelect
          name="userRole"
          sx={{ mb: 1 }}
          label={t('admin:components.user.userRole')}
          value={role}
          menu={userRoleData}
          onChange={handleChangeRole}
        />
        <FormControlLabel
          className={styles.checkbox}
          sx={{ mb: 1 }}
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
        <Button className={styles.gradientButton} onClick={() => resetFilter()}>
          Reset
        </Button>
      </Popover>
    </div>
  )
}

export default Users
