import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Button from '@etherealengine/ui/src/primitives/mui/Button'
import Checkbox from '@etherealengine/ui/src/primitives/mui/Checkbox'
import FormControlLabel from '@etherealengine/ui/src/primitives/mui/FormControlLabel'
import Grid from '@etherealengine/ui/src/primitives/mui/Grid'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'
import Popover from '@etherealengine/ui/src/primitives/mui/Popover'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import Search from '../../common/Search'
import { AdminResourceState, ResourceService } from '../../services/ResourceService'
import styles from '../../styles/admin.module.scss'
import ResourceDrawer, { ResourceDrawerMode } from './ResourceDrawer'
import ResourceTable from './ResourceTable'

const Resources = () => {
  const { t } = useTranslation()
  const search = useHookstate('')
  const anchorEl = useHookstate<null | HTMLElement>(null)
  const openResourceDrawer = useHookstate(false)
  const openMenu = Boolean(anchorEl)
  const adminResourceState = useHookstate(getMutableState(AdminResourceState))

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    anchorEl.set(event.currentTarget)
  }

  const handleClose = () => {
    anchorEl.set(null)
  }

  const handleChange = (e: any) => {
    search.set(e.target.value)
  }

  const resetFilter = () => {
    ResourceService.resetFilter()
  }

  useEffect(() => {
    ResourceService.getResourceFilters()
  }, [])

  return (
    <div>
      <Grid container spacing={1} className={styles.mb10px}>
        <Grid item sm={8} xs={12}>
          <Search sx={{ flexGrow: 1 }} text={t('admin:components.resources.resources')} handleChange={handleChange} />
        </Grid>
        <Grid item sm={4} xs={8}>
          <Box sx={{ display: 'flex' }}>
            <Button
              className={styles.openModalBtn}
              type="submit"
              variant="contained"
              onClick={() => openResourceDrawer.set(true)}
            >
              {t('user:resource.createResource')}
            </Button>
            <IconButton
              onClick={handleClick}
              size="small"
              sx={{ ml: 1 }}
              className={styles.filterButton}
              aria-controls={openMenu ? 'resources-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={openMenu ? 'true' : undefined}
              icon={<Icon type="FilterList" color="info" fontSize="large" />}
            />
          </Box>
        </Grid>
      </Grid>

      <ResourceTable className={styles.rootTableWithSearch} search={search.value} />

      {openResourceDrawer.value && (
        <ResourceDrawer open mode={ResourceDrawerMode.Create} onClose={() => openResourceDrawer.set(false)} />
      )}

      {anchorEl.value && (
        <Popover
          classes={{ paper: styles.popover }}
          open={openMenu}
          anchorEl={anchorEl.value}
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
      )}
    </div>
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
                    checked={!!selected.includes(item)}
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
