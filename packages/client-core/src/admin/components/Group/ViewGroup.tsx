import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import DialogActions from '@mui/material/DialogActions'
import Drawer from '@mui/material/Drawer'
import Grid from '@mui/material/Grid'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import React, { useState } from 'react'
import { useStyles } from '../../styles/ui'
import EditGroup from './EditGroup'

interface Props {
  groupAdmin: any
  closeViewModal: any
  openView: boolean
}

const ViewGroup = (props: Props) => {
  const classes = useStyles()
  const { openView, groupAdmin, closeViewModal } = props
  const [editMode, setEditMode] = useState(false)

  return (
    <Drawer
      anchor="right"
      open={openView}
      onClose={() => closeViewModal(false)}
      classes={{ paper: classes.paperDrawer }}
    >
      {editMode ? (
        <EditGroup groupAdmin={groupAdmin} closeEditModal={setEditMode} closeViewModal={closeViewModal} />
      ) : (
        <React.Fragment>
          <Paper elevation={3} className={classes.rootPaper}>
            <Container maxWidth="sm">
              <div className={classes.locationTitle}>
                <Typography variant="h4" component="span" className={classes.typo}>
                  {groupAdmin.name}
                </Typography>
              </div>
            </Container>
          </Paper>
          <Container maxWidth="lg" className={classes.marginTop}>
            <Typography variant="h4" component="h4" className={classes.mb20px}>
              Group Information
            </Typography>
            <Container>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Typography variant="h5" component="h5" className={classes.mb10}>
                    Name:
                  </Typography>
                  <Typography variant="h5" component="h5" className={classes.mb10}>
                    Description:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" component="h6" className={classes.mb10}>
                    {groupAdmin?.name || <span className={classes.spanNone}>None</span>}
                  </Typography>
                  <Typography variant="h6" component="h6" className={classes.mb10}>
                    {groupAdmin?.description || <span className={classes.spanNone}>None</span>}
                  </Typography>
                </Grid>
              </Grid>
            </Container>
            <div className={classes.scopeFlex}>
              <div>
                <Typography variant="h4" component="h4" className={classes.mb20px}>
                  Group scopes
                </Typography>
                <Container style={{ overflowY: 'auto' }}>
                  {groupAdmin.scopes?.map((el, index) => {
                    const [label, type] = el.type.split(':')
                    return (
                      <Grid container spacing={3} key={el.id}>
                        <Grid item xs={8}>
                          <Typography variant="h6" component="h6" className={classes.mb10}>
                            {label}:
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Chip label={type} />
                        </Grid>
                      </Grid>
                    )
                  })}
                </Container>
              </div>
              <div>
                <Typography variant="h4" component="h4" className={classes.mb20px}>
                  Users Information
                </Typography>
                <List className={classes.rootList} style={{ overflowY: 'auto' }}>
                  {groupAdmin.groupUsers.map((obj) => (
                    <ListItem key={obj.id}>
                      <ListItemAvatar>
                        <Avatar style={{ textTransform: 'uppercase' }}>{obj.user.name.slice(0, 1)}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={obj.user.name}
                        classes={{ secondary: '#808080' }}
                        secondary={obj.groupUserRank}
                      />
                    </ListItem>
                  ))}
                </List>
              </div>
            </div>
          </Container>
          <DialogActions className={classes.mb10}>
            <div className={classes.marginTop}>
              <Button
                className={classes.saveBtn}
                onClick={() => {
                  setEditMode(true)
                }}
              >
                EDIT
              </Button>
              <Button onClick={() => closeViewModal()} className={classes.saveBtn}>
                CANCEL
              </Button>
            </div>
          </DialogActions>
        </React.Fragment>
      )}
    </Drawer>
  )
}

export default ViewGroup
