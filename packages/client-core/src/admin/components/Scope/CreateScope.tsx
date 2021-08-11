import React, { useState } from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import Drawer from '@material-ui/core/Drawer'
import Container from '@material-ui/core/Container'
import DialogTitle from '@material-ui/core/DialogTitle'
import Paper from '@material-ui/core/Paper'
import InputBase from '@material-ui/core/InputBase'
import FormControl from '@material-ui/core/FormControl'
import Button from '@material-ui/core/Button'
import DialogActions from '@material-ui/core/DialogActions'
import { fetchUsersAsAdmin } from '../../reducers/admin/user/service'
import { selectAdminUserState } from '../../reducers/admin/user/selector'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import { useStyles } from './styles'
import { connect } from 'react-redux'
import { selectAuthState } from '../../../user/reducers/auth/selector'
import { getGroupService } from '../../reducers/admin/group/service'
import { selectGroupState } from '../../reducers/admin/group/selector'
import { createScope } from '../../reducers/admin/scope/service'
import { formValid } from './validation'

interface Props {
  open: boolean
  handleClose: (open: boolean) => void
  fetchUsersAsAdmin?: any
  adminUserState?: any
  authState?: any
  getGroupService?: any
  adminGroupState?: any
  createScope?: any
}

const mapStateToProps = (state: any): any => {
  return {
    authState: selectAuthState(state),
    adminUserState: selectAdminUserState(state),
    adminGroupState: selectGroupState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  fetchUsersAsAdmin: bindActionCreators(fetchUsersAsAdmin, dispatch),
  getGroupService: bindActionCreators(getGroupService, dispatch),
  createScope: bindActionCreators(createScope, dispatch)
})

const CreateScope = (props: Props) => {
  const {
    open,
    handleClose,
    fetchUsersAsAdmin,
    authState,
    adminUserState,
    getGroupService,
    adminGroupState,
    createScope
  } = props
  const groups = adminGroupState.get('group').get('group')
  const users = adminUserState.get('users').get('users')
  const user = authState.get('user')

  const [state, setState] = useState({
    name: '',
    userId: '',
    groupId: '',
    formErrors: {
      name: '',
      userId: '',
      groupId: ''
    }
  })

  const classes = useStyles()

  React.useEffect(() => {
    const fetchData = async () => {
      await fetchUsersAsAdmin()
      await getGroupService()
    }
    fetchData()
  }, [user])

  const handleChange = (event) => {
    const { name } = event.target
    const value = event.target.value
    let temp = { ...state.formErrors }
    switch (name) {
      case 'name':
        temp.name = value.length < 2 ? 'Name is required' : ''
        break
      case 'userId':
        temp.userId = value.length < 2 ? 'user is required' : ''
        break
      case 'groupId':
        temp.groupId = value.length < 2 ? 'group is required' : ''
        break
      default:
        break
    }

    setState({ ...state, [name]: value, formErrors: temp })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const { name, userId, groupId } = state
    let temp = state.formErrors

    if (!state.name) {
      temp.name = 'Name is required'
    }
    if (!state.userId) {
      temp.userId = 'User is required'
    }
    if (!state.groupId) {
      temp.groupId = 'Group is required'
    }

    setState({ ...state, formErrors: temp })

    if (formValid(state, state.formErrors)) {
      createScope({ scopeName: name, userId, groupId })
      setState({
        ...state,
        name: '',
        userId: '',
        groupId: ''
      })
    }
  }

  return (
    <React.Fragment>
      <Drawer classes={{ paper: classes.paper }} anchor="right" open={open} onClose={() => handleClose(false)}>
        <Container maxWidth="sm" className={classes.marginTp}>
          <form onSubmit={(e) => handleSubmit(e)}>
            <DialogTitle id="form-dialog-title" className={classes.texAlign}>
              Create New Scope
            </DialogTitle>
            <label>Name</label>
            <Paper
              component="div"
              className={state.formErrors.name.length > 0 ? classes.redBorder : classes.createInput}
            >
              <InputBase
                className={classes.input}
                name="name"
                placeholder="Enter scope name"
                style={{ color: '#fff' }}
                autoComplete="off"
                value={state.name}
                onChange={handleChange}
              />
            </Paper>
            <label>Group</label>
            <Paper
              component="div"
              className={state.formErrors.groupId.length > 0 ? classes.redBorder : classes.createInput}
            >
              <FormControl fullWidth>
                <Select
                  labelId="demo-controlled-open-select-label"
                  id="demo-controlled-open-select"
                  fullWidth
                  name="groupId"
                  displayEmpty
                  className={classes.select}
                  MenuProps={{ classes: { paper: classes.selectPaper } }}
                  value={state.groupId}
                  onChange={handleChange}
                >
                  <MenuItem value="" disabled>
                    <em>Select group</em>
                  </MenuItem>
                  {groups.map((group) => (
                    <MenuItem value={group.id} key={group.id}>
                      {group.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>
            <label>User</label>
            <Paper
              component="div"
              className={state.formErrors.userId.length > 0 ? classes.redBorder : classes.createInput}
            >
              <FormControl fullWidth>
                <Select
                  labelId="demo-controlled-open-select-label"
                  id="demo-controlled-open-select"
                  fullWidth
                  name="userId"
                  displayEmpty
                  className={classes.select}
                  MenuProps={{ classes: { paper: classes.selectPaper } }}
                  value={state.userId}
                  onChange={handleChange}
                >
                  <MenuItem value="" disabled>
                    <em>Select user</em>
                  </MenuItem>
                  {users.map((user) => (
                    <MenuItem value={user.id} key={user.id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>

            <DialogTitle id="form-dialog-title">Grand access</DialogTitle>

            <label>Location</label>
            <Paper
              component="div"
              className={state.formErrors.userId.length > 0 ? classes.redBorder : classes.createInput}
            >
              <FormControl fullWidth>
                <Select
                  labelId="demo-controlled-open-select-label"
                  id="demo-controlled-open-select"
                  fullWidth
                  name="userId"
                  displayEmpty
                  className={classes.select}
                  MenuProps={{ classes: { paper: classes.selectPaper } }}
                  value={state.userId}
                  onChange={handleChange}
                >
                  <MenuItem value="" disabled>
                    <em>Select user</em>
                  </MenuItem>
                  <MenuItem value={'write'}>Write</MenuItem>
                  <MenuItem value={'read'}>Read</MenuItem>
                </Select>
              </FormControl>
            </Paper>
            <label>Scene</label>
            <Paper
              component="div"
              className={state.formErrors.userId.length > 0 ? classes.redBorder : classes.createInput}
            >
              <FormControl fullWidth>
                <Select
                  labelId="demo-controlled-open-select-label"
                  id="demo-controlled-open-select"
                  fullWidth
                  name="scene"
                  displayEmpty
                  className={classes.select}
                  MenuProps={{ classes: { paper: classes.selectPaper } }}
                  value={state.userId}
                  onChange={handleChange}
                >
                  <MenuItem value="" disabled>
                    <em>Select user</em>
                  </MenuItem>
                  <MenuItem value={'write'}>Write</MenuItem>
                  <MenuItem value={'read'}>Read</MenuItem>
                </Select>
              </FormControl>
            </Paper>
            <label>static resource</label>
            <Paper
              component="div"
              className={state.formErrors.userId.length > 0 ? classes.redBorder : classes.createInput}
            >
              <FormControl fullWidth>
                <Select
                  labelId="demo-controlled-open-select-label"
                  id="demo-controlled-open-select"
                  fullWidth
                  name="userId"
                  displayEmpty
                  className={classes.select}
                  MenuProps={{ classes: { paper: classes.selectPaper } }}
                  value={state.userId}
                  onChange={handleChange}
                >
                  <MenuItem value="" disabled>
                    <em>Select user</em>
                  </MenuItem>
                  <MenuItem value={'write'}>Write</MenuItem>
                  <MenuItem value={'read'}>Read</MenuItem>
                </Select>
              </FormControl>
            </Paper>

            <label>Bot</label>
            <Paper
              component="div"
              className={state.formErrors.userId.length > 0 ? classes.redBorder : classes.createInput}
            >
              <FormControl fullWidth>
                <Select
                  labelId="demo-controlled-open-select-label"
                  id="demo-controlled-open-select"
                  fullWidth
                  name="userId"
                  displayEmpty
                  className={classes.select}
                  MenuProps={{ classes: { paper: classes.selectPaper } }}
                  value={state.userId}
                  onChange={handleChange}
                >
                  <MenuItem value="" disabled>
                    <em>Select user</em>
                  </MenuItem>
                  <MenuItem value={'write'}>Write</MenuItem>
                  <MenuItem value={'read'}>Read</MenuItem>
                </Select>
              </FormControl>
            </Paper>
            <label>global Avatars</label>
            <Paper
              component="div"
              className={state.formErrors.userId.length > 0 ? classes.redBorder : classes.createInput}
            >
              <FormControl fullWidth>
                <Select
                  labelId="demo-controlled-open-select-label"
                  id="demo-controlled-open-select"
                  fullWidth
                  name="userId"
                  displayEmpty
                  className={classes.select}
                  MenuProps={{ classes: { paper: classes.selectPaper } }}
                  value={state.userId}
                  onChange={handleChange}
                >
                  <MenuItem value="" disabled>
                    <em>Select user</em>
                  </MenuItem>
                  <MenuItem value={'write'}>Write</MenuItem>
                  <MenuItem value={'read'}>Read</MenuItem>
                </Select>
              </FormControl>
            </Paper>
            <DialogActions className={classes.marginTp}>
              <Button type="submit" className={classes.saveBtn}>
                Submit
              </Button>
              <Button onClick={() => handleClose(false)} className={classes.saveBtn}>
                Cancel
              </Button>
            </DialogActions>
          </form>
        </Container>
      </Drawer>
    </React.Fragment>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateScope)
