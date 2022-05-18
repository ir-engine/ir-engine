import React, { useEffect } from 'react'

const WrapForVideo = ({ children }) => {
  const addToRefs = (el) => {
    if (el) {
      lazyLoadingObserver(el)
    }
  }

  useEffect(
    () => () => {
      if (lazyVideoObserver !== null) {
        lazyVideoObserver.disconnect()
      }
    },
    []
  )

  let lazyVideoObserver = null
  const lazyLoadingObserver = (lazyVideo) => {
    if ('IntersectionObserver' in window) {
      lazyVideoObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (video) {
          if (video.isIntersecting) {
            var videoSource = video.target
            videoSource.src = videoSource.dataset.src

            video.target.load()
            video.target.classList.remove('lazy')
            // lazyVideoObserver.unobserve(video.target)
          } else if (video.target.src) {
            video.target.src = ''
          }
        })
      })

      lazyVideoObserver.observe(lazyVideo)
    }
    return null
  }

  return (
    <>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          ref: addToRefs
        })
      })}
    </>
  )
}

const areEqual = (prevProps, nextProps) => {
  return prevProps.id === nextProps.id
}

export default React.memo(WrapForVideo, areEqual)
