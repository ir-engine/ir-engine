import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'

import { useAuthState } from '../../../user/services/AuthService'
import DrawerView from '../../common/DrawerView'
import InputSelect, { InputMenuItem } from '../../common/InputSelect'
import { InstanceserverService } from '../../services/InstanceserverService'
import { AdminLocationService, useAdminLocationState } from '../../services/LocationService'
import styles from '../../styles/admin.module.scss'

interface Props {
  open: boolean
  onClose: () => void
}

const PatchInstanceserver = ({ open, onClose }: Props) => {
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
      onClose()
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
      onClose()
    }
  }

  return (
    <DrawerView open={open} onClose={onClose}>
      <Container maxWidth="sm" className={styles.mt20}>
        <DialogTitle className={styles.textAlign}>{t('admin:components.setting.patchInstanceserver')}</DialogTitle>

        <InputSelect
          name="location"
          label={t('admin:components.bot.location')}
          value={state.location}
          error={state.locationError}
          menu={locationsMenu}
          onChange={handleChange}
        />

        <DialogActions>
          <Button onClick={onClose} className={styles.outlinedButton}>
            {t('admin:components.common.cancel')}
          </Button>
          <Button className={styles.gradientButton} onClick={handleSubmit}>
            {t('admin:components.common.submit')}
          </Button>
        </DialogActions>
      </Container>
    </DrawerView>
  )
}

export default PatchInstanceserver
