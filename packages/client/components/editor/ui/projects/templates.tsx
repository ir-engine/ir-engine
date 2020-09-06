// @ts-ignore
import cliffmeetingTemplateUrl from "../../assets/templates/cliffside-meeting-room.world";
import cliffmeetingTemplateThumbnail from "../../assets/templates/cliffside-meeting-room.jpg";
// @ts-ignore
import clubhubTemplateUrl from "../../assets/templates/club-hub.world";
import clubhubTemplateThumbnail from "../../assets/templates/club-hub.jpg";
// @ts-ignore
import cudilleroTemplateUrl from "../../assets/templates/cudillero-diorama.world";
import cudilleroTemplateThumbnail from "../../assets/templates/cudillero-diorama.jpg";
// @ts-ignore
import hunterslodgeTemplateUrl from "../../assets/templates/hunters-lodge.world";
import hunterslodgeTemplateThumbnail from "../../assets/templates/hunters-lodge.jpg";
// @ts-ignore
import mozatriumTemplateUrl from "../../assets/templates/moz-atrium.world";
import mozatriumTemplateThumbnail from "../../assets/templates/moz-atrium.jpg";
// @ts-ignore
import outdoormeetupTemplateUrl from "../../assets/templates/outdoor-meetup.world";
import outdoormeetupTemplateThumbnail from "../../assets/templates/outdoor-meetup.jpg";
// @ts-ignore
import riverislandTemplateUrl from "../../assets/templates/river-island.world";
import riverislandTemplateThumbnail from "../../assets/templates/river-island.jpg";
// @ts-ignore
import trippytunnelTemplateUrl from "../../assets/templates/trippy-tunnel.world";
import trippytunnelTemplateThumbnail from "../../assets/templates/trippy-tunnel.jpg";
// @ts-ignore
import wideopenTemplateUrl from "../../assets/templates/templates/wide-open-space.world";
import wideopenTemplateThumbnail from "../../assets/templates/wide-open-space.jpg";
// @ts-ignore
import craterTemplateUrl from "../../assets/templates/crater.world";
import craterTemplateThumbnail from "../../assets/templates/crater.jpg";
// @ts-ignore
import surroundedLakeTemplateUrl from "../../assets/templates/surrounded-lake.world";
import surroundedLakeTemplateThumbnail from "../../assets/templates/surrounded-lake.jpg";
const templates = [
  {
    project_id: "crater",
    name: "Crater",
    thumbnail_url: craterTemplateThumbnail,
    project_url: craterTemplateUrl
  },
  {
    project_id: "surroundedlake",
    name: "Surrounded Lake",
    thumbnail_url: surroundedLakeTemplateThumbnail,
    project_url: surroundedLakeTemplateUrl
  },
  {
    project_id: "mozatrium",
    name: "Moz Atrium",
    thumbnail_url: mozatriumTemplateThumbnail,
    project_url: mozatriumTemplateUrl
  },
  {
    project_id: "outdoormeetup",
    name: "Outdoor Meetup",
    thumbnail_url: outdoormeetupTemplateThumbnail,
    project_url: outdoormeetupTemplateUrl
  },
  {
    project_id: "riverisland",
    name: "River Island",
    thumbnail_url: riverislandTemplateThumbnail,
    project_url: riverislandTemplateUrl
  },
  {
    project_id: "clubhub",
    name: "Club Hub",
    thumbnail_url: clubhubTemplateThumbnail,
    project_url: clubhubTemplateUrl
  },
  {
    project_id: "cliffmeeting",
    name: "Cliffside Meeting Room",
    thumbnail_url: cliffmeetingTemplateThumbnail,
    project_url: cliffmeetingTemplateUrl
  },
  {
    project_id: "cudillero",
    name: "Cudillero Diorama",
    thumbnail_url: cudilleroTemplateThumbnail,
    project_url: cudilleroTemplateUrl
  },
  {
    project_id: "hunterslodge",
    name: "Hunter's Lodge",
    thumbnail_url: hunterslodgeTemplateThumbnail,
    project_url: hunterslodgeTemplateUrl
  },
  {
    project_id: "trippytunnel",
    name: "Trippy Tunnel",
    thumbnail_url: trippytunnelTemplateThumbnail,
    project_url: trippytunnelTemplateUrl
  },
  {
    project_id: "wideopen",
    name: "Wide Open Space",
    thumbnail_url: wideopenTemplateThumbnail,
    project_url: wideopenTemplateUrl
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
