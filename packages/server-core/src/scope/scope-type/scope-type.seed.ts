export const scopeTypeSeed = {
  path: 'scope-type',
  randomize: false,
  templates: [
    {
      type: 'location:read'
    },
    {
      type: 'location:write'
    },
    {
      type: 'static_resource:read'
    },
    {
      type: 'static_resource:write'
    },
    {
      type: 'editor:write'
    },
    {
      type: 'bot:read'
    },
    {
      type: 'bot:write'
    },
    {
      type: 'globalAvatars:read'
    },
    {
      type: 'globalAvatars:write'
    },
    {
      type: 'contentPacks:read'
    },
    {
      type: 'groups:read'
    },
    {
      type: 'instance:read'
    },
    {
      type: 'invite:read'
    },
    {
      type: 'party:read'
    },
    {
      type: 'user:read'
    },
    {
      type: 'scene:read'
    },
    {
      type: 'scene:write'
    }
  ]
}
