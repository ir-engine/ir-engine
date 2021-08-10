import React, { Suspense } from 'react'
import Scene from './map'
import Layout from './Layout'
import { useTranslation } from 'react-i18next'
import MarkerPin from './marker/MarkerPin'
import ProfieEdit from './profileedit/ProfileEdit'
import MicOn from './chatmicon/MicOn'
import JoinParty from './blockparty/JoinParty'
import Chat from './chatmicoff/Chat'
import Block from './loader/Block'
import Loading from './loader/Loading'
import Mic from './microphone/Mic'
import UserMessage from './user/UserMessage'
import LocationPermission from './permission/Permission'
import ProfieEditing from './profileediting/ProfileEditing'
import Microphone from './Microphone.svg'

import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'

const LocationPage = (props) => {
  const { t } = useTranslation()
  return (
    <>
      <Layout pageTitle={t('location.locationName.pageTitle')}>
        <Switch>
          <Route history={history} path="/mappa/test/1" component={Block} />
          <Route history={history} path="/mappa/test/2" component={Chat} />
          <Route history={history} path="/mappa/test/3" component={JoinParty} />
          <Route history={history} path="/mappa/test/4" component={Loading} />
          {/* <Route history={history} path='/mappa/test/5' component={LocationPermission} />
          <Route history={history} path='/mappa/test/6' component={MarkerPin} /> */}
          <Route history={history} path="/mappa/test/7" component={Mic} />
          <Route history={history} path="/mappa/test/8" component={MicOn} />
          <Route history={history} path="/mappa/test/9" component={ProfieEdit} />
          <Route history={history} path="/mappa/test/10" component={ProfieEditing} />
          <Route history={history} path="/mappa/test/11" component={UserMessage} />
        </Switch>

        <Scene locationName={props.match.params.locationName} history={props.history} />
      </Layout>
    </>
  )
}

export default LocationPage
