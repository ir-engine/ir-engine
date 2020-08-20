import './style.scss'
import {
  Forum,
  People,
  PersonAdd
} from '@material-ui/icons'
import {
  AppBar,
  Button
} from '@material-ui/core'
import { selectChatState } from '../../../redux/chat/selector'
import { bindActionCreators, Dispatch } from 'redux'
import {
  updateMessageScrollInit
} from '../../../redux/chat/service'
import { connect } from 'react-redux'

const mapStateToProps = (state: any): any => {
  return {
    chatState: selectChatState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  updateMessageScrollInit: bindActionCreators(updateMessageScrollInit, dispatch)
})

interface Props {
  setLeftDrawerOpen: any
  setTopDrawerOpen: any
  setRightDrawerOpen: any
  setBottomDrawerOpen: any
  updateMessageScrollInit?: any
}

export const DrawerControls = (props: Props): JSX.Element => {
//   const homeNav = (): void => {
//     Router.push('/')
//   }
  const openChat = (): void => {
    props.setLeftDrawerOpen(false)
    props.setTopDrawerOpen(false)
    props.setRightDrawerOpen(false)
    props.setBottomDrawerOpen(true)
    setTimeout(() => props.updateMessageScrollInit(true), 100)
  }
  const openPeople = (): void => {
    props.setLeftDrawerOpen(true)
    props.setTopDrawerOpen(false)
    props.setRightDrawerOpen(false)
    props.setBottomDrawerOpen(false)
  }
  const openInvite = (): void => {
    props.setLeftDrawerOpen(false)
    props.setTopDrawerOpen(false)
    props.setRightDrawerOpen(true)
    props.setBottomDrawerOpen(false)
  }
  return (
    <AppBar className="bottom-appbar">
      <Button onClick={openInvite}>
        <PersonAdd />
      </Button>
      <Button onClick={openChat}>
        <Forum />
      </Button>
      <Button onClick={openPeople}>
        <People/>
      </Button>
    </AppBar>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(DrawerControls)
