import config from '../../config';

const localTemplates = [
  {
    plan: 'xr3ngine-basic-local',
    name: 'XR3ngine Basic Local',
    type: 'monthly',
    amount: 5,
    seats: 1
  },
  {
    plan: 'xr3ngine-premium-local',
    name: 'XR3ngine Premium Local',
    type: 'monthly',
    amount: 20,
    seats: 1
  },
  {
    plan: 'xr3ngine-deluxe-local',
    name: 'XR3ngine Deluxe Local',
    type: 'monthly',
    amount: 100,
    seats: 1
  }
];

const devTemplates = [
  {
    plan: 'xr3ngine-basic-dev',
    name: 'XR3ngine Basic Dev',
    type: 'monthly',
    amount: 5,
    seats: 1
  },
  {
    plan: 'xr3ngine-premium-dev',
    name: 'XR3ngine Premium Dev',
    type: 'monthly',
    amount: 20,
    seats: 1
  },
  {
    plan: 'xr3ngine-deluxe-dev',
    name: 'XR3ngine Deluxe Dev',
    type: 'monthly',
    amount: 100,
    seats: 1
  }
];

const stagingTemplates = [
  {
    plan: 'xr3ngine-basic-staging',
    name: 'XR3ngine Basic Staging',
    type: 'monthly',
    amount: 5,
    seats: 1
  },
  {
    plan: 'xr3ngine-premium-staging',
    name: 'XR3ngine Premium Staging',
    type: 'monthly',
    amount: 20,
    seats: 1
  },
  {
    plan: 'xr3ngine-deluxe-staging',
    name: 'XR3ngine Deluxe Staging',
    type: 'monthly',
    amount: 100,
    seats: 1
  }
];

const prodTemplates = [
  {
    plan: 'xr3ngine-basic-prod',
    name: 'XR3ngine Basic',
    type: 'monthly',
    amount: 5,
    seats: 1
  },
  {
    plan: 'xr3ngine-premium-prod',
    name: 'XR3ngine Premium',
    type: 'monthly',
    amount: 20,
    seats: 1
  },
  {
    plan: 'xr3ngine-deluxe-prod',
    name: 'XR3ngine Deluxe',
    type: 'monthly',
    amount: 100,
    seats: 1
  }
];

const templatesMap = {
  local: localTemplates,
  dev: devTemplates,
  staging: stagingTemplates,
  prod: prodTemplates
};

const templateMap = config.deployStage ? templatesMap[config.deployStage] : templatesMap.local;

export const seed = {
  disabled: !config.db.forceRefresh,
  delete: config.db.forceRefresh,
  path: 'subscription-type',
  randomize: false,
  templates: templateMap
};

export default seed;
