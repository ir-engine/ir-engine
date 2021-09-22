import React, { useEffect } from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { selectAuthState } from '@xrengine/client-core/src/user/reducers/auth/selector'
import { useTranslation } from 'react-i18next'
import IconButton from '@material-ui/core/IconButton'
import AddCircleIcon from '@material-ui/icons/AddCircle'
import { Button, Fab, Grid, makeStyles, Tooltip, Typography } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  fab: {
    margin: theme.spacing(2)
  },
  absolute: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(3)
  },
  uploadButton: {
    width: '150px',
    height: '150px',
    backgroundColor: '#F8F8F8',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
    // position:"absolute",
    // top:"10%",
    // left:"50%",
    // marginLeft:"auto",
  },
  iconButton: {
    backgroundColor: 'transparent'
  },
  circleIcon: {
    fontSize: '7rem',
    color: '#CFCFCF',
    '&:hover': {
      backgroundColor: 'transparent'
    }
  },
  typography: {
    textTransform: 'uppercase',
    color: '#CFCFCF',
    padding: '2.5px',
    backgroundColor: 'white',
    border: '1px 1px #F8F8F8',
    fontFamily: 'Jost'
  }
}))

function Uploadbutton() {
  const classes = useStyles()
  return (
    <div>
      <label htmlFor="raised-button-file">
        <div className={classes.uploadButton}>
          <IconButton disableRipple aria-label="delete" className={classes.iconButton}>
            <AddCircleIcon className={classes.circleIcon} />
          </IconButton>
          <Typography align="center" className={classes.typography} variant="h6">
            Add Files
          </Typography>
        </div>
      </label>
    </div>
  )
}

export default Uploadbutton
