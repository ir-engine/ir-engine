import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Group } from '@xrengine/common/src/interfaces/Group'

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

import styles from '../../styles/admin.module.scss'
import EditGroup from './EditGroup'

interface Props {
  groupAdmin: Group
  closeViewModal: (open: boolean) => void
  openView: boolean
}

const ViewGroup = (props: Props) => {
  const { openView, groupAdmin, closeViewModal } = props
  const [editMode, setEditMode] = useState(false)
  const { t } = useTranslation()

  return (
    <Drawer
      anchor="right"
      open={openView}
      onClose={() => closeViewModal(false)}
      classes={{ paper: styles.paperDrawer }}
    >
      {editMode ? (
        <EditGroup groupAdmin={groupAdmin} closeEditModal={setEditMode} closeViewModal={closeViewModal} />
      ) : (
        <React.Fragment>
          <Paper elevation={3} className={styles.rootPaper}>
            <Container maxWidth="sm">
              <div className={styles.locationTitle}>
                <Typography variant="h4" component="span" className={styles.typo}>
                  {groupAdmin.name}
                </Typography>
              </div>
            </Container>
          </Paper>
          <Container maxWidth="lg" className={styles.mt30px}>
            <Typography variant="h4" component="h4" className={styles.mb20px}>
              {t('admin:components.group.groupInformation')}
            </Typography>
            <Container>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Typography variant="h5" component="h5" className={styles.mb10}>
                    {t('admin:components.group.name')}:
                  </Typography>
                  <Typography variant="h5" component="h5" className={styles.mb10}>
                    {t('admin:components.group.description')}:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" component="h6" className={styles.mb10}>
                    {groupAdmin?.name || <span className={styles.spanNone}>None</span>}
                  </Typography>
                  <Typography variant="h6" component="h6" className={styles.mb10}>
                    {groupAdmin?.description || <span className={styles.spanNone}>None</span>}
                  </Typography>
                </Grid>
              </Grid>
            </Container>
            <div className={styles.scopeFlex}>
              <div>
                <Typography variant="h4" component="h4" className={styles.mb20px}>
                  {t('admin:components.group.groupScopes')}
                </Typography>
                <Container style={{ overflowY: 'auto' }}>
                  {groupAdmin?.scopes?.map((el, index) => {
                    const [label, type] = el.type.split(':')
                    return (
                      <Grid container spacing={3} key={el.id}>
                        <Grid item xs={8}>
                          <Typography variant="h6" component="h6" className={styles.mb10}>
                            {label}:
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Chip label={type} className={styles.chip} />
                        </Grid>
                      </Grid>
                    )
                  })}
                </Container>
              </div>
              <div>
                <Typography variant="h4" component="h4" className={styles.mb20px}>
                  {t('admin:components.group.usersInformation')}
                </Typography>
                <List className={styles.rootList} style={{ overflowY: 'auto' }}>
                  {groupAdmin?.groupUsers?.map((obj) => (
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
          <DialogActions className={styles.mb10}>
            <DialogActions className={styles.mt30px}>
              <Button
                className={styles.submitButton}
                onClick={() => {
                  setEditMode(true)
                }}
              >
                {t('admin:components.group.edit')}
              </Button>
              <Button onClick={() => closeViewModal(false)} className={styles.cancelButton}>
                {t('admin:components.group.cancel')}
              </Button>
            </DialogActions>
          </DialogActions>
        </React.Fragment>
      )}
    </Drawer>
  )
}

export default ViewGroup
