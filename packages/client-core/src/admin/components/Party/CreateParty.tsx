import React, { useState, useEffect } from 'react'
import Fade from '@material-ui/core/Fade'
import Modal from '@material-ui/core/Modal'
import styles from '../Admin.module.scss'
import Backdrop from '@material-ui/core/Backdrop'
import classNames from 'classnames'
import Autocomplete from '@material-ui/lab/Autocomplete'
import TextField from '@material-ui/core/TextField'
import { bindActionCreators, Dispatch } from 'redux'
import { fetchAdminLocations } from '../../reducers/admin/location/service'
import { connect } from 'react-redux'
import { selectAuthState } from '../../../user/reducers/auth/selector'
import { createAdminParty } from '../../reducers/admin/party/service'
import { fetchAdminInstances } from '../../reducers/admin/instance/service'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { Props } from './variables'
import { useStyles } from './style'
import { selectAdminLocationState } from '../../reducers/admin/location/selector'
import { selectAdminInstanceState } from '../../reducers/admin/instance/selector'

const mapStateToProps = (state: any): any => {
  return {
    authState: selectAuthState(state),
    adminInstanceState: selectAdminInstanceState(state),
    adminLocationState: selectAdminLocationState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  fetchAdminLocations: bindActionCreators(fetchAdminLocations, dispatch),
  fetchAdminInstances: bindActionCreators(fetchAdminInstances, dispatch),
  createAdminParty: bindActionCreators(createAdminParty, dispatch)
})

const CreateParty = (props: Props) => {
  const classes = useStyles()

  const {
    open,
    handleClose,
    createAdminParty,
    fetchAdminLocations,
    authState,
    fetchAdminInstances,
    adminInstanceState,
    adminLocationState
  } = props

  const [location, setLocation] = useState('')
  const [instance, setInstance] = React.useState('')

  const user = authState.get('user')
  const adminLocation = adminLocationState.get('locations')
  const locationData = adminLocation.get('locations')
  const adminInstances = adminInstanceState.get('instances')
  const instanceData = adminInstances.get('instances')

  useEffect(() => {
    if (user?.id != null && adminLocation.get('updateNeeded') === true) {
      fetchAdminLocations()
    }

    if (user.id && adminInstances.get('updateNeeded')) {
      fetchAdminInstances()
    }
  }, [authState, adminLocationState, adminInstanceState])

  const defaultProps = {
    options: locationData,
    getOptionLabel: (option: any) => option.name
  }

  const data = []
  instanceData.forEach((element) => {
    data.push(element)
  })

  const InstanceProps = {
    options: data,
    getOptionLabel: (option: any) => option.ipAddress
  }

  const submitParty = async (e) => {
    e.preventDefault()
    await createAdminParty({
      locationId: location,
      instanceId: instance
    })
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
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500
        }}
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

export default connect(mapStateToProps, mapDispatchToProps)(CreateParty)
