import React, { useEffect, useState } from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListSubheader from '@material-ui/core/ListSubheader'
import DownloadModal from './DownloadModal'
import { useContentPackState } from '../../reducers/contentPack/ContentPackState'
import { ConfirmProvider } from 'material-ui-confirm'
import { fetchContentPacks } from '../../reducers/contentPack/ContentPackService'
import ContentPackDetailsModal from './ContentPackDetailsModal'
import styles from './ContentPack.module.scss'

interface Props {
  fetchContentPacks?: any
}

const mapStateToProps = (state: any): any => {
  return {}
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  fetchContentPacks: bindActionCreators(fetchContentPacks, dispatch)
})

const ContentPacksConsole = (props: Props) => {
  const { fetchContentPacks } = props
  const [downloadModalOpen, setDownloadModalOpen] = useState(false)
  const [contentPackDetailsModalOpen, setContentPackDetailsModalOpen] = useState(false)
  const [selectedContentPack, setSelectedContentPack] = useState({ avatars: [], scenes: [] })
  const contentPackState = useContentPackState()
  const contentPacks = contentPackState.contentPacks

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
    if (contentPackState.updateNeeded.value === true) {
      fetchContentPacks()
    }
  }, [contentPackState.updateNeeded.value])

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
        {contentPacks.value.map((contentPack) => (
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
