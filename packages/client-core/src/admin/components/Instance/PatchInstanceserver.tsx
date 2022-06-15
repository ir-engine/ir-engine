import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import Drawer from '@mui/material/Drawer'

import { useAuthState } from '../../../user/services/AuthService'
import InputSelect, { InputMenuItem } from '../../common/InputSelect'
import { InstanceserverService } from '../../services/InstanceserverService'
import { AdminLocationService, useAdminLocationState } from '../../services/LocationService'
import styles from '../../styles/admin.module.scss'

interface Props {
  open: boolean
  handleClose: any
  closeViewModal?: any
}

const PatchInstanceserver = ({ open, handleClose, closeViewModal }: Props) => {
  const [state, setState] = React.useState({
    location: '',
    locationError: ''
  })

  const { t } = useTranslation()
  const authState = useAuthState()
  const user = authState.user
  const adminLocationState = useAdminLocationState()
  const location = adminLocationState
  const adminLocations = adminLocationState.locations

  useEffect(() => {
    if (user?.id.value && adminLocationState.updateNeeded.value) {
      AdminLocationService.fetchAdminLocations()
    }
  }, [user?.id?.value, adminLocationState.updateNeeded.value])

  const locationsMenu: InputMenuItem[] = adminLocations.value.map((el) => {
    return {
      label: el.name,
      value: el.id
    }
  })

  useEffect(() => {
    if (location.created.value) {
      closeViewModal(false)
      setState({
        ...state,
        location: ''
      })
    }
  }, [location.created])

  const handleChange = (e) => {
    const { name, value } = e.target
    setState({ ...state, [name]: value, locationError: value.length < 2 ? 'Location is required!' : '' })
  }

  const handleSubmit = () => {
    let locationError = ''
    if (!state.location) {
      locationError = "Location can't be empty"
      setState({ ...state, locationError })
    } else {
      InstanceserverService.patchInstanceserver(state.location)
      closeViewModal(false)
    }
  }

  return (
    <React.Fragment>
      <Drawer anchor="right" classes={{ paper: styles.paperDrawer }} open={open} onClose={handleClose(false)}>
        <Container maxWidth="sm" className={styles.mt20}>
          <DialogTitle id="form-dialog-title" className={styles.textAlign}>
            {t('admin:components.setting.patchInstanceserver')}
          </DialogTitle>

          <InputSelect
            name="location"
            label={t('admin:components.bot.location')}
            value={state.location}
            error={state.locationError}
            menu={locationsMenu}
            onChange={handleChange}
          />

          <DialogActions>
            <Button className={styles.submitButton} onClick={handleSubmit}>
              {t('admin:components.setting.save')}
            </Button>
            <Button onClick={handleClose(false)} className={styles.cancelButton}>
              {t('admin:components.setting.cancel')}
            </Button>
          </DialogActions>
        </Container>
      </Drawer>
    </React.Fragment>
  )
}

export default PatchInstanceserver
