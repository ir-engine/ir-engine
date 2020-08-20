import React, { Fragment } from 'react';

const Error = ({ statusCode }: { statusCode?: number }): any => {
  return (
    <Fragment>
      <p>
        {statusCode
          ? `An error ${statusCode} occurred on server`
          : 'An error occurred on client'}
      </p>
      <a href="/">Go home</a>
    </Fragment>
  );
};

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
