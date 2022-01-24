import MuiAlert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import InputBase from '@mui/material/InputBase'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Snackbar from '@mui/material/Snackbar'
import { AdminScopeType } from '@xrengine/common/src/interfaces/AdminScopeType'
import React from 'react'
import { useAuthState } from '../../../user/services/AuthService'
import { ScopeTypeService, useScopeTypeState } from '../../services/ScopeTypeService'
import { staticResourceService, useStaticResourceState } from '../../services/StaticResourceService'
import { UserRoleService, useUserRoleState } from '../../services/UserRoleService'
import { UserService } from '../../services/UserService'
import { useStyles } from '../../styles/ui'
import CreateUserRole from './CreateUserRole'
import { validateUserForm } from './validation'

const Alert = (props) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />
}

interface Props {
  open: boolean
  handleClose: any
  closeViewModel: any
}

const CreateUser = (props: Props) => {
  const { open, handleClose, closeViewModel } = props

  const classes = useStyles()
  const [openCreateaUserRole, setOpenCreateUserRole] = React.useState(false)
  const [state, setState] = React.useState({
    name: '',
    avatar: '',
    userRole: '',
    scopeTypes: [] as Array<AdminScopeType>,
    formErrors: {
      name: '',
      avatar: '',
      userRole: '',
      scopeTypes: ''
    }
  })

  const [openWarning, setOpenWarning] = React.useState(false)
  const [error, setError] = React.useState('')

  const user = useAuthState().user
  const userRole = useUserRoleState()
  const userRoleData = userRole ? userRole.userRole?.value : []
  const staticResource = useStaticResourceState()
  const staticResourceData = staticResource.staticResource

  const adminScopeTypeState = useScopeTypeState()

  React.useEffect(() => {
    const fetchData = async () => {
      await UserRoleService.fetchUserRole()
    }
    const role = userRole ? userRole.updateNeeded.value : false
    if (role === true && user.id.value) fetchData()
    if (user.id.value && staticResource.updateNeeded.value) {
      staticResourceService.fetchStaticResource()
    }
    if (adminScopeTypeState.updateNeeded.value && user.id.value) {
      ScopeTypeService.getScopeTypeService()
    }
  }, [adminScopeTypeState.updateNeeded.value, staticResource.updateNeeded.value, user])

  const createUserRole = () => {
    setOpenCreateUserRole(true)
  }

  const handleUserRoleClose = () => {
    setOpenCreateUserRole(false)
  }

  const handleCloseWarning = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpenWarning(false)
  }

  const handleChangeScopeType = (e) => {
    setState({ ...state, scopeTypes: e.target.value, formErrors: { ...state.formErrors, scopeTypes: '' } })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    let temp = state.formErrors
    switch (name) {
      case 'name':
        temp.name = value.length < 2 ? 'Name is required!' : ''
        break
      case 'avatar':
        temp.avatar = value.length < 2 ? 'Avatar is required!' : ''
        break
      case 'userRole':
        temp.userRole = value.length < 2 ? 'User role is required!' : ''
        break

      default:
        break
    }
    setState({ ...state, [name]: value, formErrors: temp })
  }

  const handleSubmit = () => {
    const data = {
      name: state.name,
      avatarId: state.avatar,
      userRole: state.userRole,
      scopeTypes: state.scopeTypes
    }
    let temp = state.formErrors
    if (!state.name) {
      temp.name = "Name can't be empty"
    }
    if (!state.avatar) {
      temp.avatar = "Avatar can't be empty"
    }
    if (!state.userRole) {
      temp.userRole = "User role can't be empty"
    }
    if (!state.scopeTypes.length) {
      temp.scopeTypes = "Scope type can't be empty"
    }
    setState({ ...state, formErrors: temp })

    if (validateUserForm(state, state.formErrors)) {
      UserService.createUser(data)
      closeViewModel(false)
      setState({
        ...state,
        name: '',
        avatar: '',
        userRole: '',
        scopeTypes: []
      })
    } else {
      setError('Please fill all required field')
      setOpenWarning(true)
    }
  }

  const handleCancel = () => {
    setState({
      ...state,
      name: '',
      avatar: '',
      userRole: '',
      scopeTypes: []
    })
    closeViewModel(false)
  }

  return (
    <React.Fragment>
      <Drawer classes={{ paper: classes.paperDrawer }} anchor="right" open={open} onClose={handleClose(false)}>
        <Container maxWidth="sm" className={classes.marginTp}>
          <DialogTitle id="form-dialog-title" className={classes.texAlign}>
            Create New User
          </DialogTitle>
          <label>Name</label>
          <Paper component="div" className={state.formErrors.name.length > 0 ? classes.redBorder : classes.createInput}>
            <InputBase
              className={classes.input}
              name="name"
              placeholder="Enter name"
              style={{ color: '#fff' }}
              autoComplete="off"
              value={state.name}
              onChange={handleChange}
            />
          </Paper>
          <label>Avatar</label>
          <Paper
            component="div"
            className={state.formErrors.avatar.length > 0 ? classes.redBorder : classes.createInput}
          >
            <FormControl fullWidth>
              <Select
                labelId="demo-controlled-open-select-label"
                id="demo-controlled-open-select"
                value={state.avatar}
                fullWidth
                displayEmpty
                onChange={handleChange}
                className={classes.select}
                name="avatar"
                MenuProps={{ classes: { paper: classes.selectPaper } }}
              >
                <MenuItem value="" disabled>
                  <em>Select avatar</em>
                </MenuItem>
                {staticResourceData.value.map((el) => (
                  <MenuItem value={el.name} key={el.id}>
                    {el.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
          <label>User role</label>
          <Paper
            component="div"
            className={state.formErrors.userRole.length > 0 ? classes.redBorder : classes.createInput}
          >
            <FormControl fullWidth>
              <Select
                labelId="demo-controlled-open-select-label"
                id="demo-controlled-open-select"
                value={state.userRole}
                fullWidth
                displayEmpty
                onChange={handleChange}
                className={classes.select}
                name="userRole"
                MenuProps={{ classes: { paper: classes.selectPaper } }}
              >
                <MenuItem value="" disabled>
                  <em>Select user role</em>
                </MenuItem>
                {userRoleData.map((el) => (
                  <MenuItem value={el?.role} key={el?.role}>
                    {el?.role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
          <DialogContentText className={classes.marginBottm}>
            <span className={classes.select}>Don't see user role? </span>{' '}
            <a href="#h" className={classes.textLink} onClick={createUserRole}>
              Create One
            </a>
          </DialogContentText>
          <label>Grant Scope</label>
          <Paper
            component="div"
            className={state.formErrors.scopeTypes.length > 0 ? classes.redBorder : classes.createInput}
          >
            <FormControl fullWidth>
              <Select
                labelId="demo-controlled-open-select-label"
                id="demo-controlled-open-select"
                value={state.scopeTypes}
                fullWidth
                displayEmpty
                onChange={handleChangeScopeType}
                className={classes.select}
                name="scopeTypes"
                multiple
                renderValue={(value) =>
                  value?.length ? (Array.isArray(value) ? value.join(', ') : value) : 'Select scope'
                }
                MenuProps={{ classes: { paper: classes.selectPaper } }}
              >
                {adminScopeTypeState.scopeTypes.value.map((el) => (
                  <MenuItem value={el?.type} key={el?.type}>
                    {el?.type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
          <DialogActions>
            <Button className={classes.saveBtn} onClick={handleSubmit}>
              Submit
            </Button>
            <Button onClick={handleCancel} className={classes.saveBtn}>
              Cancel
            </Button>
          </DialogActions>
          <Snackbar
            open={openWarning}
            autoHideDuration={6000}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert onClose={handleCloseWarning} severity="warning">
              {error}
            </Alert>
          </Snackbar>
        </Container>
      </Drawer>
      <CreateUserRole open={openCreateaUserRole} handleClose={handleUserRoleClose} />
    </React.Fragment>
  )
}

export default CreateUser
