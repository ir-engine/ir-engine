import { PopoverState } from '@ir-engine/client-core/src/common/services/PopoverState'
import { EditorState } from '@ir-engine/editor/src/services/EditorServices'
import { getMutableState, useHookstate } from '@ir-engine/hyperflux'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineExclamationCircle } from 'react-icons/hi2'

const downloadGoogleLink =
  'https://www.google.com/chrome/dr/download/?brand=CBFU&ds_kid=43700079286123654&gad_source=1&gclid=CjwKCAjwooq3BhB3EiwAYqYoEkgLBNGFDuKclZQTGAA8Lzq66cvirjjOm7ur0ayMgKvn9y3Fd1spThoCXu0QAvD_BwE&gclsrc=aw.ds'

export const UnsupportedBrowser = () => {
  const { t } = useTranslation()

  const { acknowledgedUnsupportedBrowser } = useHookstate(getMutableState(EditorState))

  const handleClose = () => {
    acknowledgedUnsupportedBrowser.set(true)
    PopoverState.hidePopupover()
  }

  return (
    <Modal className="w-10/12 md:w-6/12" hideFooter>
      <div className="flex flex-col rounded-lg bg-[#0e0f11] px-5 py-10 text-center">
        <div className="mb-10 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#191b1f]">
            <HiOutlineExclamationCircle className="text-3xl text-[#d6a407]" />
          </div>
        </div>

        <Text fontSize="2xl" fontWeight="bold" className="capitalize">
          {t('common:unsupportedBrowser.title')}
        </Text>
        <Text fontSize="lg" className="mt-4 text-[#b2b5bd]">
          {t('common:unsupportedBrowser.description')}
        </Text>

        <div className="mt-10 flex justify-between">
          <Button onClick={() => window.open(downloadGoogleLink)}>
            {t('common:unsupportedBrowser.downloadChrome')}
          </Button>
          <Button onClick={handleClose}>{t('common:unsupportedBrowser.continue')}</Button>
        </div>
      </div>
    </Modal>
  )
}
