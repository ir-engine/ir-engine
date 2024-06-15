import { NO_PROXY } from '@etherealengine/hyperflux'
import { loadWebappInjection } from '@etherealengine/projects/loadWebappInjection'
import { useHookstate } from '@hookstate/core'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { LoadingCircle } from './LoadingCircle'

export const LoadWebappInjection = (props) => {
  const { t } = useTranslation()

  const projectComponents = useHookstate(null as null | any[])

  useEffect(() => {
    loadWebappInjection().then((result) => {
      projectComponents.set(result)
    })
  }, [])

  if (!projectComponents.value) return <LoadingCircle message={t('common:loader.authenticating')} />

  return (
    <>
      {projectComponents.get(NO_PROXY)!.map((Component, i) => (
        <Component key={i} />
      ))}
      {props.children}
    </>
  )
}
