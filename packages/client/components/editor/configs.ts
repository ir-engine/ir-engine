// import "dotenv";

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

get(configs, "APP_URL", process.env.APP_URL ?? "https://localhost:3000");
get(configs, "SERVER_URL", process.env.SERVER_URL ?? "https://localhost:3030");
get(configs, "GA_TRACKING_ID", process.env.GA_TRACKING_ID);
get(configs, "SENTRY_DSN", process.env.SENTRY_DSN);

(configs as any).name = (): string => "Scene Editor";
(configs as any).longName = (): string => "Scene Editor";

export default configs;
