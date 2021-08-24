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
      type: 'scene:write'
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
    }
  ]
}
