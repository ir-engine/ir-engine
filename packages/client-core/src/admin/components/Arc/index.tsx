import React from 'react'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { useStyles } from './styles'
import SearchVideo from './SearchVideo'
import MediaTable from './MediaTable'
import MediaModel from './CreateVideo'
import { getArMediaService } from '../../../socialmedia/reducers/arMedia/service'
import { selectArMediaState } from '../../../socialmedia/reducers/arMedia/selector'

interface Props {
  list?: any
  getArMediaService?: () => void
  adminArmediaState?: any
}

const mapStateToProps = (state: any): any => {
  return {
    adminArmediaState: selectArMediaState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getArMediaService: bindActionCreators(getArMediaService, dispatch)
})

const VideoMedia = (props: Props) => {
  const { getArMediaService, adminArmediaState } = props
  //   const [allMedia, setAllMedia] = useState(props.list)

  const armediaState = adminArmediaState.get('arMedia')
  const armediaData = armediaState.get('arMedia')

  React.useEffect(() => {
    if (armediaState.get('updateNeeded')) {
      getArMediaService()
    }
  }, [armediaState])
  const classes = useStyles()
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

  return (
    <div>
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
        <MediaTable list={armediaData} />
      </div>
      {mediaModalOpen && (
        <MediaModel open={mediaModalOpen} handleClose={openModalCreate} closeViewModel={closeViewModel} />
      )}
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(VideoMedia)
