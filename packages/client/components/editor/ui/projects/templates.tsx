const templates = [
  {
    project_id: "surroundedlake",
    name: "Surrounded Lake",
    thumbnail_url: "editor/templates/surrounded-lake.jpg",
    project_url: "editor/templates/surrounded-lake.world"
  },
  {
    project_id: "mozatrium",
    name: "Moz Atrium",
    thumbnail_url: "editor/templates/moz-atrium.jpg",
    project_url: "editor/templates/moz-atrium.world"
  },
  {
    project_id: "outdoormeetup",
    name: "Outdoor Meetup",
    thumbnail_url: "editor/templates/outdoor-meetup.jpg",
    project_url: "editor/templates/outdoor-meetup.world"
  },
  {
    project_id: "riverisland",
    name: "River Island",
    thumbnail_url: "editor/templates/river-island.jpg",
    project_url: "editor/templates/river-island.world"
  },
  {
    project_id: "clubhub",
    name: "Club Hub",
    thumbnail_url: "editor/templates/club-hub.jpg",
    project_url: "editor/templates/club-hub.world"
  },
  {
    project_id: "cliffmeeting",
    name: "Cliffside Meeting Room",
    thumbnail_url:  "editor/templates/cliffside-meeting-room.jpg",
    project_url: "editor/templates/cliffside-meeting-room.world"
  },
  {
    project_id: "cudillero",
    name: "Cudillero Diorama",
    thumbnail_url: "editor/templates/cudillero-diorama.jpg",
    project_url: "editor/templates/cudillero-diorama.world"
  },
  {
    project_id: "hunterslodge",
    name: "Hunter's Lodge",
    thumbnail_url: "editor/templates/hunters-lodge.jpg",
    project_url: "editor/templates/hunters-lodge.world"
  },
  {
    project_id: "trippytunnel",
    name: "Trippy Tunnel",
    thumbnail_url: "editor/templates/trippy-tunnel.jpg",
    project_url: "editor/templates/trippy-tunnel.world"
  },
  {
    project_id: "wideopen",
    name: "Wide Open Space",
    thumbnail_url: "editor/templates/wide-open-space.jpg",
    project_url: "editor/templates/templates/wide-open-space.world"
  }
];
function transformUrls(templates) {
  const searchParams = new URLSearchParams();
  for (const template of templates) {
    searchParams.set("template", template.project_url);
    template.url = "/projects/new?" + searchParams;
  }
  return templates;
}
export default transformUrls(templates);
/* eslint-enable */
