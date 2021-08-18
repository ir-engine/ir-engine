import React from 'react'
import Lottie from 'react-lottie'
import * as lottieLoaderData from './lottie_loader.json'
const Block = () => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: lottieLoaderData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  }
  return <Lottie options={defaultOptions} height={400} width={400} />
}

export default Block
