import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { VisibleComponent } from '@xrengine/engine/src/scene/components/VisibleComponent'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './styles.module.scss'
import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import NameInputGroup from './NameInputGroup'


const EntityMetadataEditor = (props) => {
  const [isVisible, setVisible] = useState(true)
  const [isPersist, setPersist] = useState(false)
  const [includeInCubeMapBake, setIncludeInCubeMapBake] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    const visibleComponent = getComponent(props.node.eid, VisibleComponent)
    if (visibleComponent) {
      setVisible(visibleComponent.visible)
    }
  }, [props.node])

  const onChangeVisible = (value) => {
    setVisible(value)
    const visibleComponent = getComponent(props.node.eid, VisibleComponent)
    visibleComponent.visible = value
  }

  const onChangePersist = (value) => {
    setPersist(value)
    const visibleComponent = getComponent(props.node.eid, VisibleComponent)
    visibleComponent.persist = value
  }

  const onChangeIncludeInBake = (value) => {
    setIncludeInCubeMapBake(value)
    const visibleComponent = getComponent(props.node.eid, VisibleComponent)
    visibleComponent.includeInCubeMapBake = value
  }

  return (
    <div className={styles.metadataConainer}>
      <NameInputGroup node={props.node} />
      <InputGroup name="Visible" label={t('editor:properties.lbl-visible')}>
        <BooleanInput value={isVisible} onChange={onChangeVisible} />
      </InputGroup>
      <InputGroup name="Bake Static" label="Bake Static">
        <BooleanInput value={includeInCubeMapBake} onChange={onChangeIncludeInBake} />
      </InputGroup>
      <InputGroup name="Persist" label={t('editor:properties.lbl-persist')}>
        <BooleanInput value={isPersist} onChange={onChangePersist} />
      </InputGroup>
    </div>
  )
}

export default EntityMetadataEditor