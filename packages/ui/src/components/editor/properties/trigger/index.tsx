import { defineQuery } from '@etherealengine/ecs'
import { EditorComponentType } from '@etherealengine/editor/src/components/properties/Util'
import { CallbackComponent } from '@etherealengine/spatial/src/common/CallbackComponent'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { HiPlus } from 'react-icons/hi2'
import { PiTrashSimple } from 'react-icons/pi'
import Select from '../../../../primitives/tailwind/Select'
import Text from '../../../../primitives/tailwind/Text'
import InputGroup from '../../input/Group'
import StringInput from '../../input/String'

type OptionsType = Array<{
  callbacks: Array<{
    label: string
    value: string
  }>
  label: string
  value: string
}>

const callbackQuery = defineQuery([CallbackComponent])

const TriggerProperties: EditorComponentType = (props) => {
  const { t } = useTranslation()
  // const targets = useHookstate<OptionsType>([{ label: 'Self', value: 'Self', callbacks: [] }])

  // const triggerComponent = useComponent(props.entity, TriggerComponent)

  // useEffect(() => {
  //   const options = [] as OptionsType
  //   options.push({
  //     label: 'Self',
  //     value: 'Self',
  //     callbacks: []
  //   })
  //   for (const entity of callbackQuery()) {
  //     if (entity === props.entity || !hasComponent(entity, EntityTreeComponent)) continue
  //     const callbacks = getComponent(entity, CallbackComponent)
  //     options.push({
  //       label: getComponent(entity, NameComponent),
  //       value: getComponent(entity, UUIDComponent),
  //       callbacks: Object.keys(callbacks).map((cb) => {
  //         return { label: cb, value: cb }
  //       })
  //     })
  //   }
  //   targets.set(options)
  // }, [])

  return (
    <>
      <div className="mb-3 mt-5 flex items-center">
        <Text fontSize="xs" className="ml-12">
          {t('editor:properties.triggerVolume.name')}
        </Text>
        <div className="ml-auto mr-5 flex items-center gap-1">
          <HiPlus className="text-sm text-[#8B8B8D]" />
          <PiTrashSimple className="text-sm text-[#8B8B8D]" />
        </div>
      </div>
      <div className="w-full bg-[#1A1A1A]">
        {/* {triggerComponent.triggers.map((trigger, index) => {
          const targetOption = targets.value.find((o) => o.value === trigger.target.value)
          const target = targetOption ? targetOption.value : 'Self'
          return ( */}
        <>
          <InputGroup name="Target" label={t('editor:properties.triggerVolume.lbl-target')}>
            <Select
              value="Self"
              onChange={() => {}}
              options={[]}
              // value={trigger.target.value ?? 'Self'}
              // onChange={commitProperty(TriggerComponent, `triggers.${index}.target` as any)}
              // options={targets.value}
              disabled={props.multiEdit}
            />
          </InputGroup>
          <InputGroup name="On Enter" label={t('editor:properties.triggerVolume.lbl-onenter')}>
            {/* {targetOption?.callbacks.length == 0 ? ( */}
            {true ? (
              <StringInput
                value=""
                onChange={() => {}}
                // value={trigger.onEnter.value!}
                // onChange={updateProperty(TriggerComponent, `triggers.${index}.onEnter` as any)}
                // onRelease={commitProperty(TriggerComponent, `triggers.${index}.onEnter` as any)}
                // disabled={props.multiEdit || !target}
              />
            ) : (
              <Select
                value=""
                onChange={() => {}}
                options={[]}
                // value={trigger.onEnter.value!}
                // onChange={commitProperty(TriggerComponent, `triggers.${index}.onEnter` as any)}
                // options={targetOption?.callbacks ? targetOption.callbacks : []}
                // disabled={props.multiEdit || !target}
              />
            )}
          </InputGroup>

          <InputGroup name="On Exit" label={t('editor:properties.triggerVolume.lbl-onexit')}>
            {/* {targetOption?.callbacks.length == 0 ? ( */}
            {true ? (
              <StringInput
                value=""
                onChange={() => {}}
                // value={trigger.onExit.value!}
                // onRelease={updateProperty(TriggerComponent, `triggers.${index}.onExit` as any)}
                // onChange={commitProperty(TriggerComponent, `triggers.${index}.onExit` as any)}
                // disabled={props.multiEdit || !target}
              />
            ) : (
              <Select
                value=""
                options={[]}
                onChange={() => {}}
                // value={trigger.onExit.value!}
                // onChange={commitProperty(TriggerComponent, `triggers.${index}.onExit` as any)}
                // options={targetOption?.callbacks ? targetOption.callbacks : []}
                // disabled={props.multiEdit || !target}
              />
            )}
          </InputGroup>
        </>
        {/* )
        })} */}
      </div>
    </>
  )
}

export default TriggerProperties
