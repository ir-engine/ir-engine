import React from 'react'
import { Drawer, Paper, Typography } from '@material-ui/core'
import Container from '@material-ui/core/Container'
import { useStyle, useStyles } from './styles'

interface Props {
  viewModal: boolean
}

const ViewScene = (props: Props) => {
  const { viewModal } = props
  const classes = useStyles()
  const classesx = useStyle()

  return (
    <React.Fragment>
      <Drawer classes={{ paper: classesx.paper }} anchor="right" open={viewModal}>
        <React.Fragment>
          <Paper elevation={3} className={classes.paperHeight}>
            <Container maxWidth="sm">
              <div className={classes.center}>
                <Typography variant="h4" component="span" className={classes.typo}>
                  scene name
                </Typography>
              </div>
            </Container>
          </Paper>
        </React.Fragment>
      </Drawer>
    </React.Fragment>
  )
}

export default ViewScene
