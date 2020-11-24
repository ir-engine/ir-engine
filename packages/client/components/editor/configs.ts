// import "dotenv";
import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();

// Read configs from meta tags if available, otherwise use the process.env injected from build.
const configs = {};
const get = (configs, key, defaultValue) => {
  if (!(process as any)?.browser) {
    return;
  }
  const el = document.querySelector(`meta[name='env:${key.toLowerCase()}']`);
  if (el) {
    configs[key] = el.getAttribute("content");
  } else {
    configs[key] = defaultValue;
  }
};

get(configs, "GA_TRACKING_ID", process.env.GA_TRACKING_ID);
get(configs, "SENTRY_DSN", process.env.SENTRY_DSN);

(configs as any).name = (): string => "Scene Editor";
(configs as any).longName = (): string => "Scene Editor";
(configs as any).SERVER_URL = process.env.NODE_ENV === 'production' ? publicRuntimeConfig.apiServer : 'https://localhost:3030';
(configs as any).APP_URL = process.env.NODE_ENV === 'production' ? publicRuntimeConfig.appServer : 'https://localhost:3000';

export default configs;
