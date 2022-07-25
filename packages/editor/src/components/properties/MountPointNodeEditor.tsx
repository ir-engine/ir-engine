import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { ErrorComponent } from '@xrengine/engine/src/scene/components/ErrorComponent'
import { MountPoint, MountPointComponent } from '@xrengine/engine/src/scene/components/MountPointComponent'
import { addError } from '@xrengine/engine/src/scene/functions/ErrorFunctions'

import InputGroup from '../inputs/InputGroup'
import ModelInput from '../inputs/ModelInput'
import SelectInput from '../inputs/SelectInput'
import CollapsibleBlock from '../layout/CollapsibleBlock'
import NodeEditor from './NodeEditor'
import { EditorPropType, updateProperty } from './Util'

type SelectOptionType = { label: string; value: string }
const MountPointTypes = [{ label: 'Seat', value: MountPoint.seat }]

export const useEmoteMenuHooks = (node: EntityTreeNode) => {
  const [enterAnimations, setEnterAnimations] = useState<SelectOptionType[]>([] as SelectOptionType[])
  const [leaveAnimations, setLeaveAnimations] = useState<SelectOptionType[]>([] as SelectOptionType[])
  const [activeAnimations, setActiveAnimations] = useState<SelectOptionType[]>([] as SelectOptionType[])

  const updateComponentAnimations = (type: 'enter' | 'active' | 'leave', setFunction: Function) => {
    const animations: SelectOptionType[] = []
    const mountPointComponent = getComponent(node.entity, MountPointComponent)

    mountPointComponent.animation[type]!.animations.forEach((animation) => {
      animations.push({ label: animation, value: animation })
    })

    setFunction(animations)
  }

  const updateAnimationFile = async (src: string, type: 'enter' | 'active' | 'leave', setFunction: Function) => {
    const key = 'animation.' + type + '.file'
    try {
      AssetLoader.Cache.delete(src)
      const model = await AssetLoader.loadAsync(src)
      const animations: SelectOptionType[] = []
      const mountPointComponent = getComponent(node.entity, MountPointComponent)

      if (!mountPointComponent.animation[type]) {
        mountPointComponent.animation[type] = {
          file: '',
          animation: '',
          animations: []
        }
      } else {
        mountPointComponent.animation[type]!.animations = []
      }

      ;(model.animations ?? model.scene.animations).forEach((animation) => {
        mountPointComponent.animation[type]!.animations.push(animation.name)
        animations.push({ label: animation.name, value: animation.name })
      })

      setFunction(animations)
      updateProperty(MountPointComponent, key as any)(src)
    } catch (err) {
      addError(node.entity, key, '')
    }
  }

  const updateEnterAnimationFile = async (src: string) => {
    updateAnimationFile(src, 'enter', setEnterAnimations)
  }

  const updateLeaveAnimationFile = async (src: string) => {
    updateAnimationFile(src, 'leave', setLeaveAnimations)
  }

  const updateActiveAnimationFile = async (src: string) => {
    updateAnimationFile(src, 'active', setActiveAnimations)
  }

  const updateEnterAnimations = async () => {
    updateComponentAnimations('enter', setEnterAnimations)
  }

  const updateLeaveAnimations = async () => {
    updateComponentAnimations('leave', setLeaveAnimations)
  }

  const updateActiveAnimations = async () => {
    updateComponentAnimations('active', setActiveAnimations)
  }

  return {
    enterAnimations,
    leaveAnimations,
    activeAnimations,
    updateEnterAnimationFile,
    updateLeaveAnimationFile,
    updateActiveAnimationFile,
    updateEnterAnimations,
    updateLeaveAnimations,
    updateActiveAnimations
  }
}

export const MountPointNodeEditor: React.FC<EditorPropType> = (props) => {
  const { t } = useTranslation()
  const engineState = useEngineState()
  const {
    enterAnimations,
    leaveAnimations,
    activeAnimations,
    updateEnterAnimationFile,
    updateActiveAnimationFile,
    updateLeaveAnimationFile,
    updateActiveAnimations,
    updateEnterAnimations,
    updateLeaveAnimations
  } = useEmoteMenuHooks(props.node)

  useEffect(() => {
    if (mountPointComponent.animation.enter) {
      if (!mountPointComponent.animation.enter.animations) {
        updateEnterAnimationFile(mountPointComponent.animation.enter.file)
      } else {
        updateEnterAnimations()
      }
    }

    if (mountPointComponent.animation.active) {
      if (!mountPointComponent.animation.active.animations) {
        updateActiveAnimationFile(mountPointComponent.animation.active.file)
      } else {
        updateActiveAnimations()
      }
    }

    if (mountPointComponent.animation.leave) {
      if (!mountPointComponent.animation.leave.animations) {
        updateLeaveAnimationFile(mountPointComponent.animation.leave.file)
      } else {
        updateLeaveAnimations()
      }
    }
  }, [])

  const mountPointComponent = getComponent(props.node.entity, MountPointComponent)
  const hasError = engineState.errorEntities[props.node.entity].get()
  const errorComponent = getComponent(props.node.entity, ErrorComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.mountPoint.name')}
      description={t('editor:properties.mountPoint.description')}
    >
      <InputGroup name="Type" label={t('editor:properties.mountPoint.lbl-type')}>
        <SelectInput
          key={props.node.entity}
          options={MountPointTypes}
          value={mountPointComponent.type}
          onChange={updateProperty(MountPointComponent, 'type')}
        />
      </InputGroup>
      {mountPointComponent.type === MountPoint.seat && (
        <>
          <CollapsibleBlock label={t('editor:properties.mountPoint.lbl-animations')}>
            <CollapsibleBlock label={t('editor:properties.mountPoint.lbl-enter')}>
              <InputGroup name="Enter File" label={t('editor:properties.mountPoint.lbl-file')}>
                <ModelInput
                  value={mountPointComponent.animation.enter?.file || ''}
                  onChange={updateEnterAnimationFile}
                />
                {hasError && errorComponent?.['animation.enter.file'] && (
                  <div style={{ marginTop: 2, color: '#FF8C00' }}>{t('editor:properties.mountPoint.error-url')}</div>
                )}
              </InputGroup>
              <InputGroup name="Enter Animation" label={t('editor:properties.mountPoint.lbl-animation')}>
                <SelectInput
                  key={props.node.entity}
                  options={enterAnimations}
                  value={mountPointComponent.animation.enter?.animation ?? ''}
                  onChange={updateProperty(MountPointComponent, 'animation.enter.animation' as any)}
                />
              </InputGroup>
            </CollapsibleBlock>
            <CollapsibleBlock label={t('editor:properties.mountPoint.lbl-active')}>
              <InputGroup name="Active File" label={t('editor:properties.mountPoint.lbl-file')}>
                <ModelInput
                  value={mountPointComponent.animation.active?.file || ''}
                  onChange={updateActiveAnimationFile}
                />
                {hasError && errorComponent?.['animation.active.file'] && (
                  <div style={{ marginTop: 2, color: '#FF8C00' }}>{t('editor:properties.mountPoint.error-url')}</div>
                )}
              </InputGroup>
              <InputGroup name="Active Animation" label={t('editor:properties.mountPoint.lbl-animation')}>
                <SelectInput
                  key={props.node.entity}
                  options={activeAnimations}
                  value={mountPointComponent.animation.active?.animation ?? ''}
                  onChange={updateProperty(MountPointComponent, 'animation.active.animation' as any)}
                />
              </InputGroup>
            </CollapsibleBlock>
            <CollapsibleBlock label={t('editor:properties.mountPoint.lbl-leave')}>
              <InputGroup name="Leave File" label={t('editor:properties.mountPoint.lbl-file')}>
                <ModelInput
                  value={mountPointComponent.animation.leave?.file || ''}
                  onChange={updateLeaveAnimationFile}
                />
                {hasError && errorComponent?.['animation.leave.file'] && (
                  <div style={{ marginTop: 2, color: '#FF8C00' }}>{t('editor:properties.mountPoint.error-url')}</div>
                )}
              </InputGroup>
              <InputGroup name="Leave Animation" label={t('editor:properties.mountPoint.lbl-animation')}>
                <SelectInput
                  key={props.node.entity}
                  options={leaveAnimations}
                  value={mountPointComponent.animation.leave?.animation ?? ''}
                  onChange={updateProperty(MountPointComponent, 'animation.leave.animation' as any)}
                />
              </InputGroup>
            </CollapsibleBlock>
          </CollapsibleBlock>
        </>
      )}
    </NodeEditor>
  )
}

export default MountPointNodeEditor
