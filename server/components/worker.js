/*

    Assignment Docs

    0 = Send Message
    1 = Send Comment
    2 = Scrape Followers
    3 = Scrape Hashtags
    4 = Scrape Following

    Filters - [user] [username] automatically gets replaced with the target's username
*/

const Redis = require('redis');
// Instagram API Functions
const BotExecutor = require('../bot');

async function message_filter(message, username) {
    return await Variables.variable_filter(message, username)
}

async function send_message(username, password, targets, letter, proxy, redis, ID, email) {
    const botExecutor = new BotExecutor();
    let count = 0
    var data;
    botExecutor.on('job_finished', async (message) => {
        console.log('Job finished with message:', message);
        var r = await redis.get(`user_${email}`)
        r = JSON.parse(r)

        var data = r.threads.find((thread) => thread.ID == ID);

        if (data) {
            //! Make something that would cache the people that has been outreached
            data.status = "done"
            data.data.finished = count > data.data.finished ? count : data.data.finished
            r = await redis.set(`user_${email}`, JSON.stringify(r))
            // socket.emit("task_finished", { ID: ID, result: res, type: "send_message" })
            process.send({ status: "TASK_FINISHED", action: `sending ${count} messages`, name: data.data.leadname || data.data.campaignname, location: data.data.leadname ? "leads" : "campaigns" })
        } else {
            process.send({ status: "ERROR", error: "Thread Not Found" });
        }
    });

    botExecutor.on('message', async (message) => {
        console.log('Received message:', message);
        if (message.startsWith("SENT DM TO USER")) {
            const username = message.split("SENT DM TO USER ")[1].split(" ")[0]
            var r = await redis.get(`user_${email}`)
            r = JSON.parse(r)

            data = r.threads.find((thread) => thread.ID == ID);
            data.data.finished = data.data.finished ? data.data.finished + 1 : 1
            count = count + 1
            r = await redis.set(`user_${email}`, JSON.stringify(r))
            process.send({ status: "NOTIFICATION", message: `Sent DM to ${username}` })
            // Process the message here or perform any actions based on the message
        }
    });

    botExecutor.on('error', async (err) => {
        process.send({ status: "ERROR", error: err.message })
        process.send({ status: "ERROR", error: "The thread is being deleted due to a problem. Please check your proxy, your username and password." })
        var r = await redis.get(`user_${email}`);
        r = JSON.parse(r);
        var data = r.threads.find((thread) => thread.ID == ID);
        data.status = "warning"
        r = await redis.set(`user_${email}`, JSON.stringify(r));
        return false;
    });

    botExecutor.executeScript([
        "send_dm",
        JSON.stringify(targets),
        letter,
        username,
        password,
        proxy
    ])
}

async function send_comment(username, password, target, message, proxy) {
    try {
        const client = new IgApiClient();
        client.state.generateDevice(username);
        client.state.proxyUrl = proxy
        await client.account.login(username, password);

        target = await client.user.getIdByUsername(target);

        const post = await Posts.Latest_Post(client, target);

        message = await message_filter(message, target)

        return await Comment.send_comment(client, message, target, post)
    } catch (e) {
        process.send({ status: "ERROR", error: err.message })
        process.send({ status: "ERROR", error: "The thread is being deleted due to a problem. Please check your proxy, your username and password." })

        return false;
    }
}

async function fetch_followers(amount, target, redis, ID, email) {
    const botExecutor = new BotExecutor();

    botExecutor.on('job_finished', async (message) => {
        const res = JSON.parse(message)
        console.log('Job finished with message:', message);
        var r = await redis.get(`user_${email}`)
        r = JSON.parse(r)

        var data = r.threads.find((thread) => thread.ID == ID);

        if (data) {
            data.data.finished = Object.keys(res).length
            data.data.result = res
            data.status = "done"
            r = await redis.set(`user_${email}`, JSON.stringify(r))
            // socket.emit("task_finished", { ID: ID, result: res, type: "scrape_followers" })
            // process.send({ status: "TASK_FINISHED", ID: ID, result: res, type: "scrape_followers" })
            process.send({ status: "TASK_FINISHED", action: `scraping ${data.data.finished} followers`, name: data.data.leadname || data.data.campaignname, location: data.data.leadname ? "leads" : "campaigns" })
        } else {
            process.send({ status: "ERROR", error: "Thread Not Found" });
        }
    });

    botExecutor.on('message', (message) => {
        console.log('Received message:', message);
        // Process the message here or perform any actions based on the message
    });

    botExecutor.on('error', async (err) => {
        process.send({ status: "ERROR", error: err.message })
        var r = await redis.get(`user_${email}`);
        r = JSON.parse(r);
        var data = r.threads.find((thread) => thread.ID == ID);
        data.status = "warning"
        r = await redis.set(`user_${email}`, JSON.stringify(r));
        return false;
    });

    botExecutor.executeScript([
        "scrape_followers",
        target,
        amount
    ])
}

// Fetch following
async function fetch_following(amount, target, redis, ID, email) {
    const botExecutor = new BotExecutor();

    botExecutor.on('job_finished', async (message) => {
        const res = JSON.parse(message)
        console.log('Job finished with message:', message);
        var r = await redis.get(`user_${email}`)
        r = JSON.parse(r)

        var data = r.threads.find((thread) => thread.ID == ID);

        if (data) {
            data.data.finished = Object.keys(res).length
            data.data.result = res
            data.status = "done"
            r = await redis.set(`user_${email}`, JSON.stringify(r))
            // socket.emit("task_finished", { ID: ID, result: res, type: "scrape_following" })
            // process.send({ status: "TASK_FINISHED", ID: ID, result: res, type: "scrape_following" })
            process.send({ status: "TASK_FINISHED", action: `scraping ${data.data.finished} following`, name: data.data.leadname || data.data.campaignname, location: data.data.leadname ? "leads" : "campaigns" })
        } else {
            process.send({ status: "ERROR", error: "Thread Not Found" });
        }
    });

    botExecutor.on('message', (message) => {
        console.log('Received message:', message);
        // Process the message here or perform any actions based on the message
    });

    botExecutor.on('error', async (err) => {
        process.send({ status: "ERROR", error: err.message })
        var r = await redis.get(`user_${email}`);
        r = JSON.parse(r);
        var data = r.threads.find((thread) => thread.ID == ID);
        data.status = "warning"
        r = await redis.set(`user_${email}`, JSON.stringify(r));
        return false;
    });

    botExecutor.executeScript([
        "scrape_following",
        target,
        amount
    ])
}

async function fetch_user_from_hashtag(target, amount, redis, ID, email) {
    const botExecutor = new BotExecutor();

    botExecutor.on('job_finished', async (message) => {
        const res = JSON.parse(message)
        console.log('Job finished with message:', message);
        var r = await redis.get(`user_${email}`);
        r = JSON.parse(r);
        var data = r.threads.find((thread) => thread.ID == ID);

        if (data) {
            data.data.finished = Object.keys(res).length
            data.data.result = res;

            r.threads = r.threads.map((thread) => {
                if (thread.ID == ID) {
                    thread.data.finished = Object.keys(res).length
                    thread.data.result = res
                    thread.status = "done"
                }
                return thread;
            });

            r = await redis.set(`user_${email}`, JSON.stringify(r));

            if (r) {
                // socket.emit("task_finished", { ID: ID, result: res, type: "scrape_hashtag" })
                // process.send({ status: "TASK_FINISHED", ID: ID, result: res, type: "scrape_hashtag" })
                process.send({ status: "TASK_FINISHED", action: `scraping ${data.data.finished} users from hashtag ${data.data.targets[0]}`, name: data.data.leadname || data.data.campaignname, location: data.data.leadname ? "leads" : "campaigns" })
            }
        }
    });

    botExecutor.on('message', (message) => {
        console.log('Received message:', message);
        // Process the message here or perform any actions based on the message
    });

    botExecutor.on('error', async (err) => {
        process.send({ status: "ERROR", error: err.message })
        var r = await redis.get(`user_${email}`);
        r = JSON.parse(r);
        var data = r.threads.find((thread) => thread.ID == ID);
        data.status = "warning"
        r = await redis.set(`user_${email}`, JSON.stringify(r));
        return false;
    });

    botExecutor.executeScript([
        "scrape_hashtag",
        target,
        amount
    ])
}

async function main(email, ID, redis) {
    var r = await redis.get(`user_${email}`)

    if (r) {
        r = JSON.parse(r)

        var data = r.threads.find((thread) => thread.ID == ID)

        if (data) {
            var assignment = data.assignment;
            var username = data.data.username;
            var password = data.data.password;
            var targets = data.data.targets; // Of this format : [ 'target1', 'target2', 'target3' ]
            var message = data.data.message;
            var proxies = r.proxies;
            var amount = data.data.amount;

            if (assignment === "0") {
                if (!targets || !message || !username || !password) {
                    process.send({
                        status: "ERROR", error: "The following parameters are missing:" +
                            (!targets ? " targets" : "") +
                            (!message ? " message" : "") +
                            (!username ? " username" : "") +
                            (!password ? " password" : "") +
                            (!(proxies.length > 0) ? " proxies" : "")
                    });
                    var r = await redis.get(`user_${email}`);
                    r = JSON.parse(r);
                    var data = r.threads.find((thread) => thread.ID == ID);
                    data.status = "warning"
                    r = await redis.set(`user_${email}`, JSON.stringify(r));
                    return
                } else {
                    var proxy = "http://user-default:XVIWM27mquqx@resi.proxiware.com:8080"//proxies[Math.floor(Math.random() * proxies.length)]
                    await send_message(username, password, targets, message, proxy, redis, ID, email)
                }
            }
            if (assignment === "1") {
                targets.map(async (target) => {
                    if (!targets || !message || !username || !password) {
                        process.send({
                            status: "ERROR", error: "The following parameters are missing:" +
                                (!targets ? " targets" : "") +
                                (!message ? " message" : "") +
                                (!username ? " username" : "") +
                                (!password ? " password" : "") +
                                (!(proxies.length > 0) ? " proxies" : "")
                        });
                        var r = await redis.get(`user_${email}`);
                        r = JSON.parse(r);
                        var data = r.threads.find((thread) => thread.ID == ID);
                        data.status = "warning"
                        r = await redis.set(`user_${email}`, JSON.stringify(r));

                        return
                    } else {
                        var proxy = "http://user-default:XVIWM27mquqx@resi.proxiware.com:8080"//proxies[Math.floor(Math.random() * proxies.length)]
                        var res = await send_comment(username, password, target, message, proxy)

                        if (res) {
                            var r = await redis.get(`user_${email}`)
                            r = JSON.parse(r)

                            data = r.threads.find((thread) => { thread.ID == ID })

                            if (data) {
                                data.data.finished = i + 1
                                r = await redis.set(`user_${email}`, JSON.stringify(r))
                            } else {
                                process.send({ status: "ERROR", error: "Thread Not Found" });
                            }
                        }
                    }
                })
            }
            if (assignment === "2") {
                if (!targets || !amount) {
                    process.send({
                        status: "ERROR", error: "The following parameters are missing:" +
                            (!targets ? " targets" : "") +
                            (!amount ? " amount" : "")
                    });
                    var r = await redis.get(`user_${email}`);
                    r = JSON.parse(r);
                    var data = r.threads.find((thread) => thread.ID == ID);
                    data.status = "warning"
                    r = await redis.set(`user_${email}`, JSON.stringify(r));
                    return
                } else {
                    var proxy = "http://user-default:XVIWM27mquqx@resi.proxiware.com:8080"//proxies[Math.floor(Math.random() * proxies.length)]
                    await fetch_followers(amount, targets[0], redis, ID, email)
                }
            }
            if (assignment === "3") {

                if (!targets || !amount) {
                    process.send({
                        status: "ERROR", error: "The following parameters are missing:" +
                            (!targets ? " targets" : "") +
                            (!amount ? " amount" : "")
                    });
                    var r = await redis.get(`user_${email}`);
                    r = JSON.parse(r);
                    var data = r.threads.find((thread) => thread.ID == ID);
                    data.status = "warning"
                    r = await redis.set(`user_${email}`, JSON.stringify(r));
                    return
                }

                var proxy = "http://user-default:XVIWM27mquqx@resi.proxiware.com:8080"//proxies[Math.floor(Math.random() * proxies.length)]
                await fetch_user_from_hashtag(targets[0], amount, redis, ID, email)
            }
            if (assignment === "4") {
                if (!targets || !amount) {
                    process.send({
                        status: "ERROR", error: "The following parameters are missing:" +
                            (!targets ? " targets" : "") +
                            (!amount ? " amount" : "")
                    });
                    var r = await redis.get(`user_${email}`);
                    r = JSON.parse(r);
                    var data = r.threads.find((thread) => thread.ID == ID);
                    data.status = "warning"
                    r = await redis.set(`user_${email}`, JSON.stringify(r));
                    return
                }

                var proxy = "http://user-default:XVIWM27mquqx@resi.proxiware.com:8080"//proxies[Math.floor(Math.random() * proxies.length)]
                await fetch_following(amount, targets[0], redis, ID, email)
            }
        }
    } else {
        return;
    }
}

process.on('message', (args) => {
    var { email, ID } = args

    const redis = Redis.createClient({
        socket: {
            host: 'redis-10615.c257.us-east-1-3.ec2.cloud.redislabs.com',
            port: 10615,
        },
        username: 'default',
        password: 'Z5pZMM3k50JFRn42pd0hdGjmaNhm1s1g'
    });

    redis.on('ready', () => {
        main(email, ID, redis)
    });

    (async () => { await redis.connect() })();
});
