import React, { useEffect, useState } from 'react'
import { useDispatch } from '../../../store'
import Button from '@material-ui/core/Button'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListSubheader from '@material-ui/core/ListSubheader'
import DownloadModal from './DownloadModal'
import { useContentPackState } from '../../state/ContentPackState'
import { ConfirmProvider } from 'material-ui-confirm'
import { ContentPackService } from '../../state/ContentPackService'
import ContentPackDetailsModal from './ContentPackDetailsModal'
import styles from './ContentPack.module.scss'

interface Props {}

const ContentPacksConsole = (props: Props) => {
  const [downloadModalOpen, setDownloadModalOpen] = useState(false)
  const [contentPackDetailsModalOpen, setContentPackDetailsModalOpen] = useState(false)
  const [selectedContentPack, setSelectedContentPack] = useState({ avatars: [], scenes: [] })
  const contentPackState = useContentPackState()
  const contentPacks = contentPackState.contentPacks
  const dispatch = useDispatch()

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
      ContentPackService.fetchContentPacks()
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

export default ContentPacksConsole
