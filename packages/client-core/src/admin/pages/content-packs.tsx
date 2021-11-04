import ContentPackConsole from '../components/ContentPack/ContentPackConsole'
import { AuthService } from '../../user/services/AuthService'
import React, { useEffect } from 'react'
import { useDispatch } from '../../store'

interface Props {}

function ContentPacks(props: Props) {
  const dispatch = useDispatch()
  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])
  return <ContentPackConsole />
}

export default ContentPacks
