import React from 'react'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'

import { useDispatch } from '@xrengine/client-core/src/store'
import { useARMediaStyles } from './styles'
import SearchVideo from './SearchVideo'
import MediaTable from './MediaTable'
import MediaModel from './CreateVideo'
import { useArMediaState } from '@xrengine/client-core/src/social/services/ArMediaService'
import { ArMediaService } from '@xrengine/client-core/src/social/services/ArMediaService'

interface Props {
  list?: any
}

const NUMBER_PER_PAGE = 12

const VideoMedia = (props: Props) => {
  //   const [allMedia, setAllMedia] = useState(props.list)
  const adminArmediaState = useArMediaState()
  const armediaState = adminArmediaState.arMedia
  const armediaData = armediaState.arMedia
  const limit = armediaState.limit
  const dispatch = useDispatch()

  React.useEffect(() => {
    if (armediaState.updateNeeded.value) {
      ArMediaService.getArMediaService()
    }
  }, [armediaState.updateNeeded.value])
  const classes = useARMediaStyles()
  const [mediaModalOpen, setMediaModalOpen] = React.useState(false)

  const openModalCreate = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return
    }

    setMediaModalOpen(open)
  }

  const closeViewModel = (open: boolean) => {
    setMediaModalOpen(open)
  }

  const fetchNextData = (e) => {
    const triggerHeight = e.target.scrollTop + e.target.offsetHeight
    if (triggerHeight >= e.target.scrollHeight && armediaData.value.length + NUMBER_PER_PAGE > limit.value) {
      ArMediaService.getArMediaService(null, limit.value + NUMBER_PER_PAGE)
    }
  }

  return (
    <div className={classes.containerScroll} onScroll={fetchNextData}>
      <Grid container spacing={3} className={classes.marginBottom}>
        <Grid item xs={12} sm={9}>
          <SearchVideo />
        </Grid>
        <Grid item xs={12} sm={3}>
          <Button className={classes.createBtn} type="submit" variant="contained" onClick={openModalCreate(true)}>
            Create Media
          </Button>
        </Grid>
      </Grid>
      <div className={classes.rootTable}>
        <MediaTable list={armediaData.value} />
      </div>
      {mediaModalOpen && (
        <MediaModel open={mediaModalOpen} handleClose={openModalCreate} closeViewModel={closeViewModel} />
      )}
    </div>
  )
}

export default VideoMedia
