export {}

// import moment from "moment";

// export default (userSeed): void => {
//     const originalUserSeedCallback = (userSeed as any).callback;

//     (userSeed as any).callback = (user, seed): Promise<any> => {
//         if (typeof originalUserSeedCallback === 'function') {
//             originalUserSeedCallback(user, seed);
//         }

//         return seed({
//             count: 10,
//             delete: false,
//             path: 'feed',
//             template: {
//                 authorId: user.id,
//                 title: "{{lorem.sentence}}",
//                 preview: "https://picsum.photos/375/210",
//                 description: "{{lorem.sentence}}",
//                 featured: "{{random.boolean}}",
//                 viewsCount: (): number => Math.round(Math.random() * 100),
//                 createdAt: (): string => moment().subtract(Math.random() * (7*24*60), 'minutes').format()
//             },
//             callback: (feed, seed) => {
//                 return Promise.all([
//                     seed({
//                         count: Math.round(Math.random() * 7),
//                         delete: false,
//                         path: 'feed-fires',
//                         template: {
//                             feedId: feed.id,
//                             authorId: user.id
//                         }
//                     }),
//                     seed({
//                         count: Math.round(Math.random()*7),
//                         delete: false,
//                         path: 'feed-bookmark',
//                         template: {
//                             feedId: feed.id,
//                             authorId: user.id
//                         }
//                     })
//                 ]);
//             }
//         });
//     };
// };
