/**
 *
 * @author Robert Long
 */
const templates = [
  {
    scene_id: 'surroundedlake',
    name: 'Surrounded Lake',
    thumbnail_url: 'editor/templates/surrounded-lake.jpg',
    scene_url: 'editor/templates/surrounded-lake.world'
  },
  {
    scene_id: 'mozatrium',
    name: 'Moz Atrium',
    thumbnail_url: 'editor/templates/moz-atrium.jpg',
    scene_url: 'editor/templates/moz-atrium.world'
  },
  {
    scene_id: 'outdoormeetup',
    name: 'Outdoor Meetup',
    thumbnail_url: 'editor/templates/outdoor-meetup.jpg',
    scene_url: 'editor/templates/outdoor-meetup.world'
  },
  {
    scene_id: 'riverisland',
    name: 'River Island',
    thumbnail_url: 'editor/templates/river-island.jpg',
    scene_url: 'editor/templates/river-island.world'
  },
  {
    scene_id: 'clubhub',
    name: 'Club Hub',
    thumbnail_url: 'editor/templates/club-hub.jpg',
    scene_url: 'editor/templates/club-hub.world'
  },
  {
    scene_id: 'cliffmeeting',
    name: 'Cliffside Meeting Room',
    thumbnail_url: 'editor/templates/cliffside-meeting-room.jpg',
    scene_url: 'editor/templates/cliffside-meeting-room.world'
  },
  {
    scene_id: 'cudillero',
    name: 'Cudillero Diorama',
    thumbnail_url: 'editor/templates/cudillero-diorama.jpg',
    scene_url: 'editor/templates/cudillero-diorama.world'
  },
  {
    scene_id: 'hunterslodge',
    name: "Hunter's Lodge",
    thumbnail_url: 'editor/templates/hunters-lodge.jpg',
    scene_url: 'editor/templates/hunters-lodge.world'
  },
  {
    scene_id: 'trippytunnel',
    name: 'Trippy Tunnel',
    thumbnail_url: 'editor/templates/trippy-tunnel.jpg',
    scene_url: 'editor/templates/trippy-tunnel.world'
  },
  {
    scene_id: 'wideopen',
    name: 'Wide Open Space',
    thumbnail_url: 'editor/templates/wide-open-space.jpg',
    scene_url: 'editor/templates/templates/wide-open-space.world'
  }
]

/**
 *
 * @author Robert Long
 * @param templates
 * @returns
 */
function transformUrls(templates) {
  const searchParams = new URLSearchParams()
  for (const template of templates) {
    searchParams.set('template', template.scene_url)
    template.url = '/projects/new?' + searchParams
  }
  return templates
}
export default transformUrls(templates)
/* eslint-enable */
