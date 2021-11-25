import React, { useState, useEffect } from 'react'
import Fade from '@mui/material/Fade'
import Modal from '@mui/material/Modal'
import styles from '../Admin.module.scss'
import classNames from 'classnames'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import { LocationService } from '../../services/LocationService'
import { useDispatch } from '../../../store'
import { useAuthState } from '../../../user/services/AuthService'
import { PartyService } from '../../services/PartyService'
import { InstanceService } from '../../services/InstanceService'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { PartyProps } from './variables'
import { usePartyStyle } from './style'
import { useLocationState } from '../../services/LocationService'
import { useInstanceState } from '../../services/InstanceService'
import { Instance } from '@xrengine/common/src/interfaces/Instance'

const CreateParty = (props: PartyProps) => {
  const classes = usePartyStyle()
  CreateParty
  const { open, handleClose } = props

  const [location, setLocation] = useState('')
  const [instance, setInstance] = React.useState('')
  const dispatch = useDispatch()
  const authState = useAuthState()
  const user = authState.user
  const adminLocationState = useLocationState()
  const locationData = adminLocationState.locations
  const adminInstanceState = useInstanceState()
  const adminInstances = adminInstanceState
  const instanceData = adminInstances.instances

  useEffect(() => {
    if (user?.id.value != null && adminLocationState.updateNeeded.value === true) {
      LocationService.fetchAdminLocations()
    }
    if (user.id.value && adminInstances.updateNeeded.value) {
      InstanceService.fetchAdminInstances()
    }
  }, [authState.user?.id?.value, adminLocationState.updateNeeded.value, adminInstanceState.updateNeeded.value])

  const defaultProps = {
    options: locationData.value,
    getOptionLabel: (option: any) => option.name
  }

  const data: Instance[] = []
  instanceData.value.forEach((element) => {
    data.push(element)
  })

  const InstanceProps = {
    options: data,
    getOptionLabel: (option: any) => option.ipAddress
  }

  const submitParty = async (e) => {
    e.preventDefault()
    await dispatch(
      PartyService.createAdminParty({
        locationId: location,
        instanceId: instance
      })
    )
    setLocation('')
    setInstance('')
    handleClose()
  }

  return (
    <React.Fragment>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={styles.modal}
        open={open}
        onClose={handleClose}
        closeAfterTransition
      >
        <Fade in={props.open}>
          <div
            className={classNames({
              [styles.paper]: true,
              [styles['modal-content']]: true
            })}
          >
            <Typography variant="h5" gutterBottom={true} className={classes.marginTop}>
              Create new party
            </Typography>
            <form>
              <Autocomplete
                onChange={(e, newValue) => setLocation(newValue.id as string)}
                {...defaultProps}
                id="debug"
                debug
                renderInput={(params) => <TextField {...params} label="Locations" className={classes.marginBottm} />}
              />

              <Autocomplete
                onChange={(e, newValue) => setInstance(newValue.id as string)}
                {...InstanceProps}
                id="debug"
                debug
                renderInput={(params) => <TextField {...params} label="Instance" className={classes.marginBottm} />}
              />

              <DialogContentText className={classes.marginBottm}>
                {' '}
                Don't see Instance?{' '}
                <a href="/admin/instance" className={classes.textLink}>
                  Create One
                </a>{' '}
              </DialogContentText>

              <DialogActions>
                <Button type="submit" color="primary" onClick={(e) => submitParty(e)}>
                  Submit
                </Button>
                <Button onClick={handleClose} color="primary">
                  Cancel
                </Button>
              </DialogActions>
            </form>
          </div>
        </Fade>
      </Modal>
    </React.Fragment>
  )
}

export default CreateParty
