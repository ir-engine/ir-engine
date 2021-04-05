import React, { Fragment, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

export const Custom404 = (): any => {
  const router = useRouter();
  const { t } = useTranslation();
  useEffect(() => {
    router.push("/");
  });
  return (
    <Fragment>
      <h1>{t('404.msg')}</h1>
    </Fragment>
  );
};

export default Custom404;
