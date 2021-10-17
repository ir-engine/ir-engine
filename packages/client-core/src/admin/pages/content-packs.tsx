import ContentPackConsole from '../components/ContentPack/ContentPackConsole'
import { AuthService } from '../../user/state/AuthService'
import React, { useEffect } from 'react'
import { useDispatch } from '@xrengine/client-core/src/store'

interface Props {}

function ContentPacks(props: Props) {
  const dispatch = useDispatch()
  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])
  return <ContentPackConsole />
}

export default ContentPacks
