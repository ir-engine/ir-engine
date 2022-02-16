import React, { useState } from 'react'
import { Save } from '@mui/icons-material'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import DialogActions from '@mui/material/DialogActions'
import Drawer from '@mui/material/Drawer'
import Grid from '@mui/material/Grid'
import InputBase from '@mui/material/InputBase'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useStyles } from '../../styles/ui'
import _ from 'lodash'

interface Props {
  openView: boolean
  closeViewModel?: any
  avatarData: any
}

const ViewAvatar = (props: Props) => {
  const classes = useStyles()
  const { openView, closeViewModel, avatarData } = props
  const [editMode, setEditMode] = useState(false)
  const [state, setState] = useState({
    name: '',
    key: '',
    url: '',
    description: '',
    formErrors: {
      name: '',
      key: '',
      url: '',
      description: ''
    }
  })
  const handleCloseDrawer = () => {
    closeViewModel(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    let temp = state.formErrors
    temp[name] = value.length < 2 ? `${_.upperFirst(name)} is required` : ''
    setState({ ...state, [name]: value, formErrors: temp })
  }

  return (
    <React.Fragment>
      <Drawer
        anchor="right"
        open={openView}
        onClose={() => handleCloseDrawer()}
        classes={{ paper: classes.paperDrawer }}
      >
        {avatarData && (
          <Paper elevation={3} className={classes.rootPaper}>
            <Container maxWidth="sm" className={classes.pad}>
              <Grid container spacing={2} className={classes.centering}>
                <Grid item xs={4}>
                  <Avatar className={classes.large} alt="avatar" src={avatarData.url} />
                </Grid>
                <Grid item xs={8}>
                  <div>
                    <Typography variant="h4" component="span" className={classes.typoFontTitle}>
                      {avatarData.name}
                    </Typography>
                  </div>
                </Grid>
              </Grid>
            </Container>
          </Paper>
        )}
        <Container maxWidth="sm">
          {editMode ? (
            <div className={classes.mt10}>
              <Typography variant="h4" component="h4" className={`${classes.mb10} ${classes.headingFont}`}>
                Update avatar Information
              </Typography>
              <label>Name</label>
              <Paper
                component="div"
                className={state.formErrors.name.length > 0 ? classes.redBorder : classes.createInput}
              >
                <InputBase
                  className={classes.input}
                  name="name"
                  placeholder="Enter name"
                  style={{ color: '#fff' }}
                  autoComplete="off"
                  value={state.name}
                  onChange={handleInputChange}
                />
              </Paper>
            </div>
          ) : (
            <div>
              <Typography
                variant="h4"
                component="h4"
                className={`${classes.mb20px} ${classes.mt5} ${classes.headingFont}`}
              >
                Avatar Information
              </Typography>
              <Grid container spacing={3} className={classes.mt5}>
                <Grid item xs={6} sm={6} style={{ paddingLeft: '10px', paddingTop: '10px', width: '100%' }}>
                  <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFont}`}>
                    Name:
                  </Typography>
                  <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFont}`}>
                    Description:
                  </Typography>
                  <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFont}`}>
                    Key:
                  </Typography>
                </Grid>
                <Grid item xs={4} sm={6} style={{ paddingLeft: '10px', paddingTop: '10px', width: '100%' }}>
                  <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFont}`}>
                    {avatarData?.name || <span className={classes.spanNone}>None</span>}
                  </Typography>
                  <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFont}`}>
                    {avatarData?.description || <span className={classes.spanNone}>None</span>}
                  </Typography>
                  <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFont}`}>
                    {avatarData?.key || <span className={classes.spanNone}>None</span>}
                  </Typography>
                </Grid>
              </Grid>
              <Typography variant="h5" component="h5" className={`${classes.mb20px} ${classes.headingFont}`}>
                Avatar
              </Typography>
              {avatarData?.url ? (
                <img alt="avatar" src={avatarData?.url} />
              ) : (
                <span className={classes.spanNone}>None</span>
              )}

              <Typography variant="h5" component="h5" className={`${classes.mb20px} ${classes.headingFont}`}>
                Thumb nail
              </Typography>
              <div className={classes.scopeContainer}></div>
            </div>
          )}
          <DialogActions className={classes.mb10}>
            {editMode ? (
              <div className={classes.marginTop}>
                <Button
                  //   onClick={handleSubmit}
                  className={classes.saveBtn}
                >
                  <span style={{ marginRight: '15px' }}>
                    <Save />
                  </span>{' '}
                  Submit
                </Button>
                <Button
                  className={classes.saveBtn}
                  // onClick={() => {
                  //   initiateData()
                  //   setEditMode(false)
                  // }}
                >
                  CANCEL
                </Button>
              </div>
            ) : (
              <div className={classes.marginTop}>
                <Button
                  className={classes.saveBtn}
                  onClick={() => {
                    setEditMode(true)
                  }}
                >
                  EDIT
                </Button>
                <Button onClick={() => handleCloseDrawer()} className={classes.saveBtn}>
                  CANCEL
                </Button>
              </div>
            )}
          </DialogActions>
        </Container>
      </Drawer>
      {/* <AlertMessage open={openWarning} handleClose={handleCloseWarning} severity="warning" message={error} /> */}
    </React.Fragment>
  )
}

export default ViewAvatar
