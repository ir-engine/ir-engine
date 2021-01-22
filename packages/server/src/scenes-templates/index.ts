import testsFallContent from "./tests-fall.json";
import skyIslandContent from "./sky-island.json";

export const contents = [
  {
    id: '~tests-fall',
    name: testsFallContent.metadata.name,
    data: testsFallContent
  },
  {
    id: '~sky-island',
    name: skyIslandContent.metadata.name,
    data: skyIslandContent
  }
];

export const indexes = contents.map(value => {
  return {
    allow_remixing: true,
    attributions: {
      content: [{ author: "", name: value.name }],
      creator: "xr3ngine"
    },
    description: null,
    id: value.id,
    images: { preview: { url: null } },
    name: value.name,
    project_id: null,
    type: "scene_listing"
  };
});