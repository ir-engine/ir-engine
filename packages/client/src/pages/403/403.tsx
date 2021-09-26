import React from 'react'
import { Link, withRouter } from 'react-router-dom'
import { Button } from '@material-ui/core'
import { useStyle, useStyles } from './style'

const UnauthorisedPage = (props) => {
  const classes = useStyles()
  const classx = useStyle()
  return (
    <div className={classx.paper}>
      <div className={classes.notFound}>
        <p className={classes.typo}>{props.message}</p>
        <Link style={{ textDecoration: 'none' }} to="/location/test">
          <Button className={classes.Btn}>location page</Button>
        </Link>
      </div>
    </div>
  )
}

export default withRouter(UnauthorisedPage)
