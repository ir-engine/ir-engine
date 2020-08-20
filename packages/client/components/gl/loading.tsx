import React from 'react';

const Loading = () => (
  <div>
    <h3>Loading...</h3>

    {/*language=CSS*/}
    <style jsx>{`
      div {
        display: flex;
        width: 100vw;
        height: 100vh;
        align-items: center;
        justify-content: center;
        color: #aaa;
        background-color: #222;
      }
    `}</style>
  </div>
);

export default Loading;