import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export function AddComment() {
  const changeRef = useRef(null)
  const [textAreaSize, setAreaSize] = useState(18)
  const { t } = useTranslation()
  const [isTyped, setTyped] = useState(false)

  return (
    <form method="POST" className="add-comment-container">
      <textarea
        className="add-comment-input"
        style={{ height: textAreaSize }}
        placeholder={t('social:addComment')}
        aria-label="Add Comment..."
        ref={changeRef}
        onChange={(e: any) => {
          setAreaSize(changeRef.current.scrollHeight)
          setTyped(e.target.value.length > 0)
        }}
      />
      <button
        type="button"
        className="add-comment-button text-14-light text-blue"
        style={{ opacity: isTyped ? 1 : 0.3 }}
      >
        {t('social:share')}
      </button>
    </form>
  )
}
