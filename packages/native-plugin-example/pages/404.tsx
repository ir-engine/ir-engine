import React, { Fragment, useEffect } from 'react';
import { useRouter } from 'next/router';

export const Custom404 = (): any => {
  const router = useRouter();
  useEffect(() => {
    router.push("/");
  });
  return (
    <Fragment>
      <h1>404 - Page Not Found</h1>
    </Fragment>
  );
};

export default Custom404;
