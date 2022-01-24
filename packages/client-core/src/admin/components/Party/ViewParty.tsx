import React, { useEffect, useState } from 'react'
import ViewDrawer from '../../common/ViewDrawer'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useStyles } from '../../styles/ui'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import { Save } from '@mui/icons-material'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import { useFetchAdminInstance } from '../../common/hooks/Instance.hooks'
import { useFetchAdminLocations } from '../../common/hooks/Location.hooks'
import { useLocationState } from '../../services/LocationService'
import { useInstanceState } from '../../services/InstanceService'
import { useAuthState } from '../../../user/services/AuthService'
import { InstanceService } from '../../services/InstanceService'
import { LocationService } from '../../services/LocationService'
import { Instance } from '@xrengine/common/src/interfaces/Instance'
import { validateForm } from '../../common/Validation/formValidation'
import { PartyService } from '../../services/PartyService'

interface Props {
  openView: boolean
  closeViewModel: () => void
  partyAdmin: any
  editMode: boolean
  handleEditMode: (open: boolean) => void
}

export default function ViewParty(props: Props) {
  const { openView, closeViewModel, partyAdmin, editMode, handleEditMode } = props
  const classes = useStyles()
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
  const adminInstances = adminInstanceState
  const instanceData = adminInstances.instances
  const locationData = adminLocationState.locations

  //Call custom hooks
  useFetchAdminInstance(user, adminInstanceState, InstanceService)
  useFetchAdminLocations(user, adminLocationState, LocationService)

  useEffect(() => {
    if (partyAdmin.instance?.id || partyAdmin?.location?.name) {
      console.log(partyAdmin.instance?.id)
      setUpdateParty({ ...updateParty, instance: partyAdmin.instance?.id, location: partyAdmin.location?.id })
    }
  }, [partyAdmin])

  const handleChange = (e) => {
    const { name, value } = e.target
    let temp = updateParty.formErrors
    switch (name) {
      case 'location':
        temp.location = value.length < 2 ? 'Location is required' : ''
        break
      case 'instance':
        temp.instance = value.length < 2 ? 'Instance is required' : ''
        break
      default:
        break
    }
    setUpdateParty({ ...updateParty, [name]: value, formErrors: temp })
  }

  const data: Instance[] = []
  instanceData.value.forEach((element) => {
    data.push(element)
  })

  const handleSubmit = async () => {
    const data = {
      locationId: updateParty.location,
      instanceId: updateParty.instance
    }
    let temp = updateParty.formErrors
    if (!updateParty.location) {
      temp.location = "Location can't be empty"
    }
    if (!updateParty.instance) {
      temp.instance = "Instance can't be empty"
    }
    setUpdateParty({ ...updateParty, formErrors: temp })

    if (validateForm(updateParty, updateParty.formErrors)) {
      await PartyService.patchParty(partyAdmin.id, data)
      setUpdateParty({ ...updateParty, location: '', instance: '' })
      closeViewModel()
    }
  }

  return (
    <ViewDrawer openView={openView} handleCloseDrawe={() => closeViewModel()}>
      <Paper elevation={0} className={classes.rootPaper}>
        {partyAdmin && (
          <Container maxWidth="sm">
            <div className={classes.locationTitle}>
              <Typography variant="h5" component="span">
                {partyAdmin?.location?.name}/{partyAdmin?.instance?.ipAddress}
              </Typography>
            </div>
          </Container>
        )}
      </Paper>
      {editMode ? (
        <Container maxWidth="sm">
          <div className={classes.mt10}>
            <Typography variant="h4" component="h4" className={`${classes.mb10} ${classes.headingFont}`}>
              Update party
            </Typography>

            <label>Instance</label>
            <Paper
              component="div"
              className={updateParty.formErrors.instance.length > 0 ? classes.redBorder : classes.createInput}
            >
              <FormControl fullWidth>
                <Select
                  labelId="demo-controlled-open-select-label"
                  id="demo-controlled-open-select"
                  value={updateParty.instance}
                  fullWidth
                  displayEmpty
                  onChange={handleChange}
                  className={classes.select}
                  name="instance"
                  MenuProps={{ classes: { paper: classes.selectPaper } }}
                >
                  <MenuItem value="" disabled>
                    <em>Select instance</em>
                  </MenuItem>
                  {data.map((el) => (
                    <MenuItem value={el?.id} key={el?.id}>
                      {el?.ipAddress}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>

            <label>Location</label>
            <Paper
              component="div"
              className={updateParty.formErrors.location.length > 0 ? classes.redBorder : classes.createInput}
            >
              <FormControl fullWidth>
                <Select
                  labelId="demo-controlled-open-select-label"
                  id="demo-controlled-open-select"
                  value={updateParty.location}
                  fullWidth
                  displayEmpty
                  onChange={handleChange}
                  className={classes.select}
                  name="location"
                  MenuProps={{ classes: { paper: classes.selectPaper } }}
                >
                  <MenuItem value="" disabled>
                    <em>Select location</em>
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
            className={`${classes.mb20px} ${classes.spacing} ${classes.typoFont} ${classes.marginTp}`}
          >
            Instance
          </Typography>
          <Grid container spacing={2} className={classes.pdlarge}>
            <Grid item xs={6}>
              <Typography variant="h6" component="h6" className={classes.mb10}>
                Ip Address:
              </Typography>
              {/* <Typography variant="h6" component="h6" className={classes.mb10}>Updated At:</Typography> */}
              <Typography variant="h6" component="h6" className={classes.mb10}>
                User:
              </Typography>
              <Typography variant="h6" component="h6" className={classes.mb10}>
                Active:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h6" component="h6" className={classes.mb10}>
                {partyAdmin?.instance?.ipAddress || <span className={classes.spanNone}>None</span>}
              </Typography>
              <Typography variant="h5" component="h5" className={classes.mb10}>
                {partyAdmin?.instance?.currentUsers}
              </Typography>
              <Typography variant="h5" component="h5" className={classes.mb10}>
                <span className={classes.spanNone}>{partyAdmin?.instance?.ended === 1 ? 'No' : 'Yes'}</span>
              </Typography>
            </Grid>
          </Grid>

          <Typography
            variant="h4"
            component="h4"
            className={`${classes.mb20px} ${classes.spacing} ${classes.typoFont} ${classes.marginTp}`}
          >
            Location
          </Typography>
          <Grid container spacing={2} className={classes.pdlarge}>
            <Grid item xs={6}>
              <Typography variant="h6" component="h6" className={classes.mb10}>
                Name:
              </Typography>
              {/* <Typography variant="h6" component="h6" className={classes.mb10}>Updated At:</Typography> */}
              <Typography variant="h6" component="h6" className={classes.mb10}>
                Maximum user:
              </Typography>
              <Typography variant="h6" component="h6" className={classes.mb10}>
                scene:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h6" component="h6" className={classes.mb10}>
                {partyAdmin?.location?.name || <span className={classes.spanNone}>None</span>}
              </Typography>
              <Typography variant="h5" component="h5" className={classes.mb10}>
                {partyAdmin?.location?.maxUsersPerInstance}
              </Typography>
              <Typography variant="h5" component="h5" className={classes.mb10}>
                {partyAdmin?.location?.sceneId || <span className={classes.spanNone}>None</span>}
              </Typography>
            </Grid>
          </Grid>
        </div>
      )}
      <DialogActions className={classes.mb10}>
        {editMode ? (
          <div className={classes.marginTpM}>
            <Button onClick={handleSubmit} className={classes.saveBtn}>
              <span style={{ marginRight: '15px' }}>
                <Save />
              </span>{' '}
              Submit
            </Button>
            <Button className={classes.saveBtn} onClick={() => handleEditMode(false)}>
              CANCEL
            </Button>
          </div>
        ) : (
          <div className={classes.marginTpM}>
            <Button className={classes.saveBtn} onClick={() => handleEditMode(true)}>
              EDIT
            </Button>
            <Button onClick={() => closeViewModel()} className={classes.saveBtn}>
              CANCEL
            </Button>
          </div>
        )}
      </DialogActions>
    </ViewDrawer>
  )
}
