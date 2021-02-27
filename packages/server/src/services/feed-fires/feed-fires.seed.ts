import config from '../../config';

const feedFires = [];

for (let i = 0; i < 10; i++) {
    feedFires.push({
        id: `seeded_orange_fire_${i}`,
        feedId: 'seeded_feed_orange_1',
        authorId: 'Orange_1'
    })
}

for (let i = 0; i < 25; i++) {
    feedFires.push({
        id: `seeded_orange_fire_${i}`,
        feedId: 'seeded_feed_orange_2',
        authorId: 'Orange_1'
    })
}

for (let i = 0; i < 8; i++) {
    feedFires.push({

        id: `seeded_orange_fire_${i}`,
        feedId: 'seeded_feed_orange_3',
        authorId: 'Orange_1'
    })
}

for (let i = 0; i < 5; i++) {
    feedFires.push({
        id: `seeded_yellow_fire_${i}`,
        feedId: 'seeded_feed_yellow_1',
        authorId: 'Yellow_1'
    })
}

for (let i = 0; i < 11; i++) {
    feedFires.push({

        id: `seeded_yellow_fire_${i}`,
        feedId: 'seeded_feed_yellow_2',
        authorId: 'Yellow_1'
    })
}

for (let i = 0; i < 10; i++) {
    feedFires.push({
        id: `seeded_green_fire_${i}`,
        feedId: 'seeded_feed_green_1',
        authorId: 'Green_1'
    })
}

for (let i = 0; i < 15; i++) {
    feedFires.push({
        id: `seeded_green_fire_${i}`,
        feedId: 'seeded_feed_green_2',
        authorId: 'Green_1'
    })
}

for (let i = 0; i < 12; i++) {
    feedFires.push({
        id: `seeded_green_fire_${i}`,
        feedId: 'seeded_feed_green_3',
        authorId: 'Green_1'
    })
}

for (let i = 0; i < 22; i++) {
    feedFires.push({
        id: `seeded_green_fire_${i}`,
        feedId: 'seeded_feed_green_4',
        authorId: 'Green_1'
    })
}

export const seed = {
    disabled: !config.db.forceRefresh,
    delete: config.db.forceRefresh,
    // randomize: false,
    path: 'feed-fire',
    templates: feedFires
};

export default seed;