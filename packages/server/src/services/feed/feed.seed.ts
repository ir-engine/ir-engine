import config from '../../config';

export const seed = {
    disabled: !config.db.forceRefresh,
    delete: config.db.forceRefresh,
    randomize: false,
    path: 'feed',
    templates:
        [
            {
                // id: '37ce32f0-208d-11eb-b02f-37cfdadfe58c',
                id: 'seeded_feed_orange_1',
                preview:'https://picsum.photos/375/210',
                featured: true,
                viewsCount: 11,
                title: 'Orange Feed 1',
                description: 'Some cool story',
                // feedFire: 20,
                // feedBookmark: 5,
                // user:{
                //     id: 'Orange_1',
                //     name: 'Orange',
                // },
                // authorId: 'Orange_1',
                createdAt: "2021-02-26 15:00:00",
                updatedAt: "2021-02-26 15:00:00"
            },
            {
                // id: '37ce32f0-208d-11eb-b02f-37cfdadfe58c',
                id: 'seeded_orange_feed_2',
                preview:'https://picsum.photos/375/210',
                featured: true,
                viewsCount: 15,
                title: 'Orange Feed 2',
                description: 'Some cool story',
                // feedFire: 10,
                // feedBookmark: 2,
                // user:{
                //     id: 'Orange_1',
                //     name: 'Orange',
                // },
                // authorId: 'Orange_1',
                createdAt: "2021-02-26 15:00:00",
                updatedAt: "2021-02-26 15:00:00"
            },
            {
                // id: '37ce32f0-208d-11eb-b02f-37cfdadfe58c',
                id: 'seeded_orange_feed_3',
                preview:'https://picsum.photos/375/210',
                featured: false,
                viewsCount: 21,
                title: 'Orange Feed 3',
                description: 'Some cool story',
                // feedFire: 30,
                // feedBookmark: 6,
                // user:{
                //     id: 'Orange_1',
                //     name: 'Orange',
                // },
                // authorId: 'Orange_1',
                createdAt: "2021-02-26 15:00:00",
                updatedAt: "2021-02-26 15:00:00"
            },
            {
                // id: '37ce32f0-208d-11eb-b02f-37cfdadfe58c',
                id: 'seeded_yellow_feed_1',
                preview:'https://picsum.photos/375/210',
                featured: false,
                viewsCount: 52,
                title: 'Yellow Feed 1',
                description: 'Some cool story',
                // feedFire: 40,
                // feedBookmark: 3,
                // user:{
                //     id: 'Yellow_1',
                //     name: 'Yellow',
                // },
                // authorId: 'Yellow_1',
                createdAt: "2021-02-26 15:00:00",
                updatedAt: "2021-02-26 15:00:00"
            },
            {
                // id: '37ce32f0-208d-11eb-b02f-37cfdadfe58c',
                id: 'seeded_yellow_feed_2',
                preview:'https://picsum.photos/375/210',
                featured: false,
                viewsCount: 29,
                title: 'Yellow Feed 2',
                description: 'Some cool story',
                // feedFire: 99,
                // feedBookmark: 15,
                // user:{
                //     id: 'Yellow_1',
                //     name: 'Yellow',
                // },
                // authorId: 'Yellow_1',
                createdAt: "2021-02-26 15:00:00",
                updatedAt: "2021-02-26 15:00:00"
            },
            {
                // id: '37ce32f0-208d-11eb-b02f-37cfdadfe58c',
                id: 'seeded_green_feed_1',
                preview:'https://picsum.photos/375/210',
                featured: true,
                viewsCount: 18,
                title: 'Green Feed 1',
                description: 'Some cool story',
                // feedFire: 123,
                // feedBookmark: 25,
                // user:{
                //     id: 'Green_1',
                //     name: 'Green',
                // },
                // authorId: 'Green_1',
                createdAt: "2021-02-26 15:00:00",
                updatedAt: "2021-02-26 15:00:00"
            },
            {
                // id: '37ce32f0-208d-11eb-b02f-37cfdadfe58c',
                id: 'seeded_green_feed_2',
                preview:'https://picsum.photos/375/210',
                featured: false,
                viewsCount: 44,
                title: 'Green Feed 2',
                description: 'Some cool story',
                // feedFire: 33,
                // feedBookmark: 7,
                // user:{
                //     id: 'Green_1',
                //     name: 'Green',
                // },
                // authorId: 'Green_1',
                createdAt: "2021-02-26 15:00:00",
                updatedAt: "2021-02-26 15:00:00"
            },
            {
                // id: '37ce32f0-208d-11eb-b02f-37cfdadfe58c',
                id: 'seeded_green_feed_3',
                preview:'https://picsum.photos/375/210',
                featured: false,
                viewsCount: 36,
                title: 'Green Feed 3',
                description: 'Some cool story',
                // feedFire: 44,
                // feedBookmark: 9,
                // user:{
                //     id: 'Green_1',
                //     name: 'Green',
                // },
                // authorId: 'Green_1',
                createdAt: "2021-02-26 15:00:00",
                updatedAt: "2021-02-26 15:00:00"
            },
            {
                // id: '37ce32f0-208d-11eb-b02f-37cfdadfe58c',
                id: 'seeded_green_feed_4',
                preview:'https://picsum.photos/375/210',
                featured: true,
                viewsCount: 85,
                title: 'Green Feed 4',
                description: 'Some cool story',
                // feedFire: 55,
                // feedBookmark: 11,
                // user:{
                //     id: 'Green_1',
                //     name: 'Green',
                // },
                // authorId: 'Green_1',
                createdAt: "2021-02-26 15:00:00",
                updatedAt: "2021-02-26 15:00:00"
            }
        ]
};

export default seed;