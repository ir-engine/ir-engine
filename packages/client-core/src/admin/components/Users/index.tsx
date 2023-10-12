/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React, { useState } from 'react'
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
import styles from '../../styles/admin.module.scss'
import UserDrawer, { UserDrawerMode } from './UserDrawer'
import UserTable from './UserTable'

const Users = () => {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [openUserDrawer, setOpenUserDrawer] = useState(false)
  const [skipGuests, setSkipGuests] = useState(false)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const openMenu = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleSkipGuests = (e: any) => {
    setSkipGuests(e.target.checked)
  }
  const handleSearchChange = (e: any) => {
    setSearch(e.target.value)
  }

  const resetFilter = () => {
    setSkipGuests(false)
  }

  return (
    <div>
      <Grid container spacing={1} className={styles.mb10px}>
        <Grid item sm={8} xs={12}>
          <Search text={t('admin:components.user.userSearch')} handleChange={handleSearchChange} />
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
      <UserTable className={styles.rootTableWithSearch} search={search} skipGuests={skipGuests} />
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
              checked={skipGuests}
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
