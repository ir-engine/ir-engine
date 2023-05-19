import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Button from '@etherealengine/ui/src/primitives/mui/Button'
import Checkbox from '@etherealengine/ui/src/primitives/mui/Checkbox'
import FormControlLabel from '@etherealengine/ui/src/primitives/mui/FormControlLabel'
import Grid from '@etherealengine/ui/src/primitives/mui/Grid'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'
import Popover from '@etherealengine/ui/src/primitives/mui/Popover'

import Search from '../../common/Search'
import { AdminUserService } from '../../services/UserService'
import styles from '../../styles/admin.module.scss'
import UserDrawer, { UserDrawerMode } from './UserDrawer'
import UserTable from './UserTable'

const Users = () => {
  const [search, setSearch] = useState('')
  const [openUserDrawer, setOpenUserDrawer] = useState(false)
  const { t } = useTranslation()
  const [checked, setChecked] = useState(false)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const openMenu = Boolean(anchorEl)

  useEffect(() => {
    AdminUserService.resetFilter()
  }, [])

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

  const resetFilter = () => {
    setChecked(false)
    AdminUserService.resetFilter()
  }

  return (
    <div>
      <Grid container spacing={1} className={styles.mb10px}>
        <Grid item sm={8} xs={12}>
          <Search text={t('admin:components.user.userSearch')} handleChange={handleChange} />
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
              icon={<Icon type="FilterList" color="info" fontSize="large" />}
            />
          </Box>
        </Grid>
      </Grid>
      <UserTable className={styles.rootTableWithSearch} search={search} />
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
          label={t('admin:components.user.hideGuests')}
        />
        <Button className={styles.gradientButton} sx={{ width: '100%' }} onClick={resetFilter}>
          {t('admin:components.common.reset')}
        </Button>
      </Popover>
    </div>
  )
}

export default Users
