import { toDisplayDateTime } from '@ir-engine/common/src/utils/datetime-sql'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FiEdit2 } from 'react-icons/fi'

export const InspectorEditor = ({ data }) => {
  const { t } = useTranslation()
  const { thumbnail = '', name = '', type = '', author = '', dateCreated = '', tags = [] } = data
  const leftCellCss = `text-left font-bold`
  const noData = '--'

  return Object.keys(data).length > 0 ? (
    <div className="flex h-full flex-col gap-6 overflow-y-auto bg-surface-3 p-3 px-10 text-text-secondary">
      <div className="align-center flex justify-center">
        <img src={thumbnail} alt={name} className="m-3 text-center" />
      </div>
      <div className="flex flex-row items-center justify-between gap-x-4 break-all">
        <Text fontSize="xl">{name}</Text>
        <div>
          <FiEdit2 />
        </div>
      </div>
      <div className="grid grid-cols-[auto_auto] gap-y-1 text-left">
        <div className={leftCellCss}>{t('editor:inspector.assetType')}</div>
        <div>{type}</div>
        <div className={leftCellCss}>{t('editor:inspector.assetAuthor')}</div>
        <div>{author || noData}</div>
        <div className={leftCellCss}>{t('editor:inspector.assetDateCreated')}</div>
        <div>{toDisplayDateTime(dateCreated) || noData}</div>
        <div className={leftCellCss}>{t('editor:inspector.assetFileSize')}</div>
        <div>{noData}</div>
        <div className={leftCellCss}>{t('editor:inspector.assetDimensions')}</div>
        <div>{noData}</div>
        <div className={leftCellCss}>{t('editor:inspector.assetMeshComplexity')}</div>
        <div>{noData}</div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="font-bold">{t('editor:inspector.assetTags')}</div>
        <div className="text-lg">
          {tags?.length > 0
            ? tags.map((tag) => (
                <span className="rounded-full border border-[#42454D] bg-surface-2 px-3 py-1">{tag}</span>
              ))
            : ''}
        </div>
      </div>
      <div>
        <button className="rounded-md bg-ui-primary px-5 py-2 text-white">
          {'+'} {t('editor:inspector.addToScene')}
        </button>
      </div>
    </div>
  ) : (
    <div className="flex h-full items-center justify-center bg-surface-3 p-3 text-text-secondary">
      {t('editor:inspector.noAssetSelected')}
    </div>
  )
}
export default InspectorEditor
