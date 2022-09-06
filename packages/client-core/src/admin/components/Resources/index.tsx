import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import FilterListIcon from '@mui/icons-material/FilterList'
import { Checkbox, FormControlLabel, Typography } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'

import Search from '../../common/Search'
import { ResourceService, useAdminResourceState } from '../../services/ResourceService'
import styles from '../../styles/admin.module.scss'
import ResourceTable from './ResourceTable'

const Resources = () => {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const openMenu = Boolean(anchorEl)
  const adminResourceState = useAdminResourceState()

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleChange = (e: any) => {
    setSearch(e.target.value)
  }

  const resetFilter = () => {
    ResourceService.resetFilter()
  }

  useEffect(() => {
    ResourceService.getResourceFilters()
  }, [])

  return (
    <React.Fragment>
      <Grid container spacing={1} className={styles.mb10px}>
        <Grid item md={12}>
          <Box sx={{ display: 'flex' }}>
            <Search sx={{ flexGrow: 1 }} text={t('admin:components.resources.resources')} handleChange={handleChange} />
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

      <ResourceTable className={styles.rootTableWithSearch} search={search} />

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
        <CheckBoxList
          title={t('admin:components.resources.mimeType')}
          items={adminResourceState.filters.value?.mimeTypes}
          selected={adminResourceState.selectedMimeTypes.value}
          setSelected={ResourceService.setSelectedMimeTypes}
        />
        <CheckBoxList
          title={t('admin:components.resources.resourceType')}
          items={adminResourceState.filters.value?.staticResourceTypes}
          selected={adminResourceState.selectedResourceTypes.value}
          setSelected={ResourceService.setSelectedResourceTypes}
        />
        <Button className={styles.gradientButton} sx={{ width: '100%' }} onClick={resetFilter}>
          {t('admin:components.common.reset')}
        </Button>
      </Popover>
    </React.Fragment>
  )
}

const CheckBoxList = ({ title, items, selected, setSelected }) => {
  const { t } = useTranslation()

  const handleChange = (e: any, item: any) => {
    if (e.target.checked) {
      setSelected([...selected, item])
    } else {
      setSelected([...selected.filter((i) => i !== item)])
    }
  }

  return (
    <Box>
      <Typography>{title}</Typography>
      {items && items.length && (
        <Box
          sx={{ maxHeight: '150px', overflow: 'auto', paddingLeft: '10px', display: 'flex', flexDirection: 'column' }}
        >
          {items.map((item) => {
            return (
              <FormControlLabel
                key={item}
                className={styles.checkbox}
                control={
                  <Checkbox
                    onChange={(e) => handleChange(e, item)}
                    name="stereoscopic"
                    className={styles.checkbox}
                    classes={{ checked: styles.checkedCheckbox }}
                    color="primary"
                    checked={selected.includes(item) ? true : false}
                  />
                }
                label={item ?? t('admin:components.common.none')}
              />
            )
          })}
        </Box>
      )}
    </Box>
  )
}

export default Resources
