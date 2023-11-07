import { IgApiClient } from 'instagram-private-api';

const ig = new IgApiClient();
// You must generate device id's before login.
// Id's generated based on seed
// So if you pass the same value as first argument - the same id's are generated every time
ig.state.generateDevice("redobsi_off");
// Optionally you can setup proxy url
// ig.state.proxyUrl = "gate.smartproxy.com:10005:spg6ppteqj:xq46vlqhOAY7iDn7tt";
(async () => {
    // Execute all requests prior to authorization in the real Android application
    // Not required but recommended
    await ig.simulate.preLoginFlow();
    const loggedInUser = await ig.account.login("redobsi_off", "yaya2007");
    // The same as preLoginFlow()
    // Optionally wrap it to process.nextTick so we dont need to wait ending of this bunch of requests
    process.nextTick(async () => await ig.simulate.postLoginFlow());
    // Create UserFeed instance to get loggedInUser's posts
    const userFeed = ig.feed.user(loggedInUser.pk);
    const myPostsFirstPage = await userFeed.items();
    // All the feeds are auto-paginated, so you just need to call .items() sequentially to get next page
    const myPostsSecondPage = await userFeed.items();
    console.log(myPostsFirstPage[0]);
})();