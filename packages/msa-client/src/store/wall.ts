import { createAnonymousActors } from "../ic/actor";
import { Post as PostInterface } from "../ic/canisters_generated/wall/wall.did";
import { atom, selectorFamily } from "recoil";

const PAGESIZE = 25;

export const WallCurrentShowing = atom({
  key: "WallCurrentShowing",
  default: [],
});

export const WallRefreshTimestamp = atom({
  key: "WallRefreshTimestamp",
  default: Date.now(),
});

export const WallTheWholeThing = selectorFamily({
  key: "WallTheWholeThing",
  get:
    (params: any) =>
    async ({ get }) => {
      let arr = [] as any;
      for (let i = 0; i < params.pageNumber; i++) {
        let p = { ...params, pageNumber: i + 1 };
        const posts = await get(WallPageQuery(p));
        arr = arr.concat(posts);
      }
      return arr;
    },
});

export const WallNoMorePosts = selectorFamily({
  key: "WallNoMorePosts",
  get:
    (params: any) =>
    async ({ get }) => {
      const wall = await get(WallPageQuery(params));
      if (!wall) return true;
      return wall.length < PAGESIZE ? true : false;
    },
});

export const WallPageQuery = selectorFamily({
  key: "WallQuery",
  get:
    (params: any) =>
    async ({ get }) => {
      if (!params) return;

      const actors = createAnonymousActors();
      if (!actors) return;

      let filter = { page: params.pageNumber } as any;
      if (params.userId) filter.user_id = params.userId.toString();
      try {
        const response: Array<PostInterface> = (await actors.wall.wall(
          JSON.stringify(filter)
        )) as Array<PostInterface>;
        return response;
      } catch (err) {
        console.error(err);
        return [];
      }
    },
});
