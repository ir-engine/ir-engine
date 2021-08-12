import React, { useEffect, useState } from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListSubheader from '@material-ui/core/ListSubheader'
import DownloadModal from './DownloadModal'
import { selectAuthState } from '../../../user/reducers/auth/selector'
import { selectAdminState } from '../../reducers/admin/selector'
import { selectContentPackState } from '../../reducers/contentPack/selector'
import { ConfirmProvider } from 'material-ui-confirm'
import { fetchContentPacks } from '../../reducers/contentPack/service'
import ContentPackDetailsModal from './ContentPackDetailsModal'
import styles from './ContentPack.module.scss'

interface Props {
  adminState?: any
  authState?: any
  contentPackState?: any
  fetchContentPacks?: any
}

const mapStateToProps = (state: any): any => {
  return {
    adminState: selectAdminState(state),
    authState: selectAuthState(state),
    contentPackState: selectContentPackState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  fetchContentPacks: bindActionCreators(fetchContentPacks, dispatch)
})

const ContentPacksConsole = (props: Props) => {
  const { fetchContentPacks, contentPackState } = props
  const [downloadModalOpen, setDownloadModalOpen] = useState(false)
  const [contentPackDetailsModalOpen, setContentPackDetailsModalOpen] = useState(false)
  const [selectedContentPack, setSelectedContentPack] = useState({ avatars: [], scenes: [] })
  const contentPacks = contentPackState.get('contentPacks')

  const openDownloadModal = () => {
    setDownloadModalOpen(true)
  }
  const closeDownloadModal = () => {
    setDownloadModalOpen(false)
  }

  const openDetailsModal = (contentPack: any) => {
    setSelectedContentPack(contentPack)
    setContentPackDetailsModalOpen(true)
  }

  const closeDetailsModal = () => {
    setSelectedContentPack({ avatars: [], scenes: [] })
    setContentPackDetailsModalOpen(false)
  }

  useEffect(() => {
    if (contentPackState.get('updateNeeded') === true) {
      fetchContentPacks()
    }
  }, [contentPackState])

  return (
    <div>
      <ConfirmProvider>
        <Button variant="contained" color="primary" onClick={openDownloadModal}>
          Download From URL
        </Button>
      </ConfirmProvider>
      <List
        className={styles['pack-list']}
        component="nav"
        aria-labelledby="current-packs"
        subheader={
          <ListSubheader component="div" id="current-packs">
            Current Content Packs
          </ListSubheader>
        }
      >
        {contentPacks.map((contentPack) => (
          <ListItem key={contentPack.name} onClick={() => openDetailsModal(contentPack)} button>
            <ListItemText>{contentPack.name}</ListItemText>
          </ListItem>
        ))}
      </List>
      <ContentPackDetailsModal
        contentPack={selectedContentPack}
        open={contentPackDetailsModalOpen}
        handleClose={() => closeDetailsModal()}
      />
      <DownloadModal open={downloadModalOpen} handleClose={closeDownloadModal} />
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(ContentPacksConsole)
