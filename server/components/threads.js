const { exec, fork } = require("child_process");

function random_int() {
    min = Math.ceil(100000000);
    max = Math.floor(900000000);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Threads {
    static async create_thread(req, res, redis) {
        const { email, assignment } = req.body;

        if (!email || !assignment) return res.status(400).json({ message: 'Missing Parameters' });

        let ID = random_int();

        let r = await redis.get(`user_${email}`);

        let user = JSON.parse(r);

        user.threads.push({
            ID: ID,
            PID: null,
            email: email,
            assignment: assignment,
            status: 'offline',
            data: {}
        })

        r = await redis.set(`user_${email}`, JSON.stringify(user));

        if (r) {
            return res.status(200).json({
                message: r,
                thread_data: {
                    ID: ID,
                    PID: null,
                    status: 'offline',
                    data: []
                }
            })
        }

        return res.status(500).json({ message: 'Internal Sever Error' })
    }

    static async get_thread(req, res, redis) {
        const { email, ID } = req.body;

        if (!email || !ID) return res.status(400).json({ message: 'Missing Parameters' });

        let r = await redis.get(`user_${email}`);

        if (r) {
            const userData = JSON.parse(r);

            const thread = userData.threads.find((thread) => thread.ID == ID);

            if (thread) {
                return res.status(200).json({
                    message: 'OK',
                    data: thread
                });
            }
        }

        return res.status(500).json({ message: 'Internal Sever Error' })
    }

    static async thread_input(req, res, redis) {
        const { email, ID, data } = req.body;

        if (!email || !ID || !data) return res.status(400).json({ message: 'Missing Parameters' });

        let r = await redis.get(`user_${email}`);

        if (r) {
            let user = JSON.parse(r);

            // Do not overwrite the data, only add if not already present and update if already present
            // user.threads.find((thread) => thread.ID == ID).data = data;
            user.threads.find((thread) => thread.ID == ID).data = { ...user.threads.find((thread) => thread.ID == ID).data, ...data };

            r = await redis.set(`user_${email}`, JSON.stringify(user));

            if (r) {
                return res.status(200).json({ message: r })
            }
        }

        return res.status(500).json({ message: 'Internal Sever Error' })
    }

    static async thread_status(req, res, redis) {
        const { email, ID, status } = req.body;

        if (!email || !ID || !status) return res.status(400).json({ message: 'Missing Parameters' });

        let r = await redis.get(`user_${email}`);

        if (r) {
            let user = JSON.parse(r);

            user.threads.find((thread) => thread.ID == ID).status = status;

            r = await redis.set(`user_${email}`, JSON.stringify(user));

            if (r) {
                return res.status(200).json({ message: r })
            }
        }

        return res.status(500).json({ message: 'Internal Sever Error' })
    }

    static async kill_thread(req, res, redis) {
        const { email, ID } = req.body;

        if (!email || !ID) return res.status(400).json({ message: 'Missing Parameters' });

        let r = await redis.get(`user_${email}`);

        if (r) {
            const data = JSON.parse(r)

            var PID = null;
            var status = null;
            var threadIndex = data.threads.findIndex(thread => thread.ID === ID);

            if (threadIndex !== -1) {
                PID = data.threads[threadIndex].PID;
                status = data.threads[threadIndex].status;
                data.threads.splice(threadIndex, 1);
            }

            console.log(PID, status);
            if (status === 'online') {
                try {
                    process.kill(PID, 'SIGTERM');
                } catch (err) {
                }
            }

            r = await redis.set(`user_${email}`, JSON.stringify(data));

            if (r) {
                return res?.status(200).json({ message: 'OK' })
            }
        }

        return res.status(500).json({ message: 'Internal Sever Error' })
    }

    static async start_thread(req, res, redis) {
        const { email, ID } = req.body;

        if (!email || !ID) return res.status(400).json({ message: 'Missing Parameters' });

        let r = await redis.get(`user_${email}`);

        if (r) {
            const data = JSON.parse(r)

            const thread = data.threads.find((thread) => thread.ID == ID)

            if (thread) {
                if (thread.status == 'offline') {
                    thread.status = 'online';
                    const child = fork('./components/worker.js');
                    child.send({
                        email: email,
                        ID: ID
                    });

                    child.on('message', (message) => {
                        // Error handler
                        console.log('Received message from child:', message);
                        if (message.status === "ERROR") {
                            const io = require("../index");
                            io.emit("error_user_" + email, message);
                        } else if (message.status === "TERMINATE") {
                            // Kill the thread
                            console.log('Killing thread');
                            this.kill_thread({ body: { email: email, ID: ID } }, null, redis);
                        } else if (message.status === "TASK_FINISHED") {
                            const io = require("../index");
                            io.emit("task_finished_user_" + email, message);
                        } else if (message.status === "NOTIFICATION") {
                            const io = require("../index");
                            io.emit("notification_user_" + email, message);
                        }
                    });

                    thread.PID = child.pid;
                    r = redis.set(`user_${email}`, JSON.stringify(data));
                    if (r) {
                        child.unref();
                        return res.status(200).json({ message: 'OK' });
                    } else {
                        child.kill();
                        return res.status(500).json({ message: 'Internal Server Error' });
                    }
                } else {
                    return res.status(400).json({ message: 'Thread Already Running' });
                }
            }
        }

        return res.status(500).json({ message: 'Internal Sever Error' })
    }

    static async server_start(redis) {
        var users = await redis.keys('user_*');

        users.forEach(async (user) => {
            var r = await redis.get(user);
            if (r) {
                const userData = JSON.parse(r);

                userData.threads = [];

                r = await redis.set(user, JSON.stringify(userData));
            }
        })
    }

}

module.exports = Threads;