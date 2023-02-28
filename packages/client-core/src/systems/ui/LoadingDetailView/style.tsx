import React from 'react'

interface LoadingDetailViewStyleProps {}

const LoadingDetailViewStyle = (props: LoadingDetailViewStyleProps) => {
  return (
    <style>{`
      #loading-container {
        position: relative;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        font-family: 'Roboto', sans-serif;
      }

      #loading-container img {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        filter: blur(5px);
        color: #fff;
      }

      #loading-ui {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 2;
        padding: 2px;
        text-align: center;
        text-shadow: 1px 1px 1px: #000;
        -webkit-font-smoothing: antialiased;
      }

      #loading-text {
        font-size: 15px;
        margin: auto;
        text-align: center;
        padding: 2px;
        color: #fff;
      }
      
      #progress-text {
        font-size: 25px;
        margin: auto;
        text-align: center;
        padding: 2px;
        color: #fff;
      }

      #progress-container {
        margin: auto;
        text-align: center;
        padding: 5px;
        width: 100px;
      }
      
      #loading-details {
        font-size: 10px;
        margin: auto;
        text-align: center;
        padding: 2px;
        color: #fff;
      }
      
    `}</style>
  )
}

export default LoadingDetailViewStyle
