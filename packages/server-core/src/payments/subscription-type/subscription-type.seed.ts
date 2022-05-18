import config from '../../appconfig'

const localTemplates = [
  {
    plan: 'xrengine-basic-local',
    name: 'XREngine Basic Local',
    type: 'monthly',
    amount: 5,
    seats: 1
  },
  {
    plan: 'xrengine-premium-local',
    name: 'XREngine Premium Local',
    type: 'monthly',
    amount: 20,
    seats: 1
  },
  {
    plan: 'xrengine-deluxe-local',
    name: 'XREngine Deluxe Local',
    type: 'monthly',
    amount: 100,
    seats: 1
  }
]

const devTemplates = [
  {
    plan: 'xrengine-basic-dev',
    name: 'XREngine Basic Dev',
    type: 'monthly',
    amount: 5,
    seats: 1
  },
  {
    plan: 'xrengine-premium-dev',
    name: 'XREngine Premium Dev',
    type: 'monthly',
    amount: 20,
    seats: 1
  },
  {
    plan: 'xrengine-deluxe-dev',
    name: 'XREngine Deluxe Dev',
    type: 'monthly',
    amount: 100,
    seats: 1
  }
]

const stagingTemplates = [
  {
    plan: 'xrengine-basic-staging',
    name: 'XREngine Basic Staging',
    type: 'monthly',
    amount: 5,
    seats: 1
  },
  {
    plan: 'xrengine-premium-staging',
    name: 'XREngine Premium Staging',
    type: 'monthly',
    amount: 20,
    seats: 1
  },
  {
    plan: 'xrengine-deluxe-staging',
    name: 'XREngine Deluxe Staging',
    type: 'monthly',
    amount: 100,
    seats: 1
  }
]

const prodTemplates = [
  {
    plan: 'xrengine-basic-prod',
    name: 'XREngine Basic',
    type: 'monthly',
    amount: 5,
    seats: 1
  },
  {
    plan: 'xrengine-premium-prod',
    name: 'XREngine Premium',
    type: 'monthly',
    amount: 20,
    seats: 1
  },
  {
    plan: 'xrengine-deluxe-prod',
    name: 'XREngine Deluxe',
    type: 'monthly',
    amount: 100,
    seats: 1
  }
]

const templatesMap = {
  local: localTemplates,
  dev: devTemplates,
  staging: stagingTemplates,
  prod: prodTemplates
}

const templateMap = config.deployStage ? templatesMap[config.deployStage] : templatesMap.local

export const subscriptionTypeSeed = {
  path: 'subscription-type',
  randomize: false,
  templates: templateMap
}
