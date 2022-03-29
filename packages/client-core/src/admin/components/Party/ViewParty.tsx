import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Instance } from '@xrengine/common/src/interfaces/Instance'
import { Party, PatchParty } from '@xrengine/common/src/interfaces/Party'

import { Save } from '@mui/icons-material'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import DialogActions from '@mui/material/DialogActions'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'

import { useAuthState } from '../../../user/services/AuthService'
import { useFetchAdminInstance } from '../../common/hooks/Instance.hooks'
import { useFetchAdminLocations } from '../../common/hooks/Location.hooks'
import { validateForm } from '../../common/validation/formValidation'
import ViewDrawer from '../../common/ViewDrawer'
import { useInstanceState } from '../../services/InstanceService'
import { InstanceService } from '../../services/InstanceService'
import { useLocationState } from '../../services/LocationService'
import { LocationService } from '../../services/LocationService'
import { PartyService } from '../../services/PartyService'
import styles from '../../styles/admin.module.scss'

interface Props {
  openView: boolean
  closeViewModal: () => void
  partyAdmin?: Party
  editMode: boolean
  handleEditMode: (open: boolean) => void
}

export default function ViewParty(props: Props) {
  const { openView, closeViewModal, partyAdmin, editMode, handleEditMode } = props
  const [updateParty, setUpdateParty] = useState({
    location: '',
    instance: '',
    formErrors: {
      location: '',
      instance: ''
    }
  })
  const authState = useAuthState()
  const user = authState.user
  const adminLocationState = useLocationState()
  const adminInstanceState = useInstanceState()
  const instanceData = adminInstanceState.instances
  const locationData = adminLocationState.locations
  const { t } = useTranslation()

  //Call custom hooks
  useFetchAdminInstance(user, adminInstanceState, InstanceService)
  useFetchAdminLocations(user, adminLocationState, LocationService)

  useEffect(() => {
    if (partyAdmin?.instance?.id || partyAdmin?.location?.name) {
      setUpdateParty({
        ...updateParty,
        instance: partyAdmin?.instance?.id ?? '',
        location: partyAdmin?.location?.id ?? ''
      })
    }
  }, [partyAdmin])

  const handleChange = (e) => {
    const { name, value } = e.target
    let temp = updateParty.formErrors
    switch (name) {
      case 'location':
        temp.location = value.length < 2 ? t('admin:components.party.locationRequired') : ''
        break
      case 'instance':
        temp.instance = value.length < 2 ? t('admin:components.party.instanceRequired') : ''
        break
      default:
        break
    }
    setUpdateParty({ ...updateParty, [name]: value, formErrors: temp })
  }

  const data: Instance[] = instanceData.value.map((element) => {
    return element
  })

  const handleSubmit = async () => {
    const data: PatchParty = {
      locationId: updateParty.location,
      instanceId: updateParty.instance
    }
    let temp = updateParty.formErrors
    if (!updateParty.location) {
      temp.location = t('admin:components.party.locationCantEmpty')
    }
    if (!updateParty.instance) {
      temp.instance = t('admin:components.party.instanceCantEmpty')
    }
    setUpdateParty({ ...updateParty, formErrors: temp })

    if (validateForm(updateParty, updateParty.formErrors) && partyAdmin) {
      await PartyService.patchParty(partyAdmin.id!, data)
      setUpdateParty({ ...updateParty, location: '', instance: '' })
      closeViewModal()
    }
  }

  return (
    <ViewDrawer openView={openView} handleCloseDrawer={() => closeViewModal()}>
      <Paper elevation={0} className={styles.rootPaper}>
        {partyAdmin && (
          <Container maxWidth="sm">
            <div className={styles.locationTitle}>
              <Typography variant="h5" component="span">
                {partyAdmin?.location?.name}/{partyAdmin?.instance?.ipAddress}
              </Typography>
            </div>
          </Container>
        )}
      </Paper>
      {editMode ? (
        <Container maxWidth="sm">
          <div className={styles.mt10}>
            <Typography variant="h4" component="h4" className={`${styles.mb10} ${styles.headingFont}`}>
              {t('admin:components.party.updateParty')}
            </Typography>

            <label>{t('admin:components.party.instance')}</label>
            <Paper
              component="div"
              className={updateParty.formErrors.instance.length > 0 ? styles.redBorder : styles.createInput}
            >
              <FormControl fullWidth>
                <Select
                  labelId="demo-controlled-open-select-label"
                  id="demo-controlled-open-select"
                  value={updateParty.instance}
                  fullWidth
                  displayEmpty
                  onChange={handleChange}
                  className={styles.select}
                  name="instance"
                  MenuProps={{ classes: { paper: styles.selectPaper } }}
                >
                  <MenuItem value="" disabled>
                    <em>{t('admin:components.party.selectInstance')}</em>
                  </MenuItem>
                  {data.map((el) => (
                    <MenuItem value={el?.id} key={el?.id}>
                      {el?.ipAddress}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>

            <label>{t('admin:components.party.location')}</label>
            <Paper
              component="div"
              className={updateParty.formErrors.location.length > 0 ? styles.redBorder : styles.createInput}
            >
              <FormControl fullWidth>
                <Select
                  labelId="demo-controlled-open-select-label"
                  id="demo-controlled-open-select"
                  value={updateParty.location}
                  fullWidth
                  displayEmpty
                  onChange={handleChange}
                  className={styles.select}
                  name="location"
                  MenuProps={{ classes: { paper: styles.selectPaper } }}
                >
                  <MenuItem value="" disabled>
                    <em>{t('admin:components.party.selectLocation')}</em>
                  </MenuItem>
                  {locationData.value.map((el) => (
                    <MenuItem value={el?.id} key={el?.id}>
                      {el?.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>
          </div>
        </Container>
      ) : (
        <div>
          <Typography
            variant="h4"
            component="h4"
            className={`${styles.mb20px} ${styles.spacing} ${styles.typoFont} ${styles.mt20}`}
          >
            {t('admin:components.party.instance')}
          </Typography>
          <Grid container spacing={2} className={styles.pdlarge}>
            <Grid item xs={6}>
              <Typography variant="h6" component="h6" className={styles.mb10}>
                {t('admin:components.party.ipAddress')}:
              </Typography>
              {/* <Typography variant="h6" component="h6" className={styles.mb10}>Updated At:</Typography> */}
              <Typography variant="h6" component="h6" className={styles.mb10}>
                {t('admin:components.party.user')}:
              </Typography>
              <Typography variant="h6" component="h6" className={styles.mb10}>
                {t('admin:components.party.active')}:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h6" component="h6" className={styles.mb10}>
                {partyAdmin?.instance?.ipAddress || (
                  <span className={styles.spanNone}>{t('admin:components.index.none')}</span>
                )}
              </Typography>
              <Typography variant="h5" component="h5" className={styles.mb10}>
                {partyAdmin?.instance?.currentUsers}
              </Typography>
              <Typography variant="h5" component="h5" className={styles.mb10}>
                <span className={styles.spanNone}>
                  {partyAdmin?.instance?.ended === true
                    ? t('admin:components.index.no')
                    : t('admin:components.index.yes')}
                </span>
              </Typography>
            </Grid>
          </Grid>

          <Typography
            variant="h4"
            component="h4"
            className={`${styles.mb20px} ${styles.spacing} ${styles.typoFont} ${styles.mt20}`}
          >
            {t('admin:components.party.location')}
          </Typography>
          <Grid container spacing={2} className={styles.pdlarge}>
            <Grid item xs={6}>
              <Typography variant="h6" component="h6" className={styles.mb10}>
                {t('admin:components.locationModal.lbl-name')}:
              </Typography>
              {/* <Typography variant="h6" component="h6" className={styles.mb10}>Updated At:</Typography> */}
              <Typography variant="h6" component="h6" className={styles.mb10}>
                {t('admin:components.locationModal.lbl-maxuser')}:
              </Typography>
              <Typography variant="h6" component="h6" className={styles.mb10}>
                {t('admin:components.locationModal.lbl-scene')}:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h6" component="h6" className={styles.mb10}>
                {partyAdmin?.location?.name || (
                  <span className={styles.spanNone}>{t('admin:components.index.none')}</span>
                )}
              </Typography>
              <Typography variant="h5" component="h5" className={styles.mb10}>
                {partyAdmin?.location?.maxUsersPerInstance}
              </Typography>
              <Typography variant="h5" component="h5" className={styles.mb10}>
                {partyAdmin?.location?.sceneId || (
                  <span className={styles.spanNone}>{t('admin:components.index.none')}</span>
                )}
              </Typography>
            </Grid>
          </Grid>
        </div>
      )}
      <DialogActions className={styles.mb10}>
        {editMode ? (
          <>
            <Button onClick={handleSubmit} className={styles.submitButton}>
              <span style={{ marginRight: '15px' }}>
                <Save />
              </span>{' '}
              {t('admin:components.party.submit')}
            </Button>
            <Button className={styles.cancelButton} onClick={() => handleEditMode(false)}>
              {t('admin:components.party.cancel')}
            </Button>
          </>
        ) : (
          <>
            <Button className={styles.submitButton} onClick={() => handleEditMode(true)}>
              {t('admin:components.party.edit')}
            </Button>
            <Button onClick={() => closeViewModal()} className={styles.cancelButton}>
              {t('admin:components.party.cancel')}
            </Button>
          </>
        )}
      </DialogActions>
    </ViewDrawer>
  )
}
