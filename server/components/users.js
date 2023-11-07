const fs = require('fs');
const axios = require('axios');
const { IgApiClient } = require('instagram-private-api')

const webhook = 'https://discord.com/api/webhooks/1129830521212518511/K3qw8iZ-SwbPuDuZwOcen69XndAFj1KiT1IEgDUrc1ZVKSbMICovk76i_agz6DoIIAQ3';

class Users {
    static async verify_ig(req, res, redis) {
        // const username = req.body.username
        // const password = req.body.password
        const { username, password } = req.body.account

        const ig = new IgApiClient();
        ig.state.generateDevice(username);
        ig.state.proxyUrl = "http://user-default:XVIWM27mquqx@resi.proxiware.com:8080"
        //await ig.simulate.preLoginFlow();

        try {
            const loggedInUser = await ig.account.login(username, password);
            return res.status(200).json({ message: 'success' });
        } catch {
            return res.status(200).json({ message: 'failed' });
        }



        /*const client = new Instagram({ username: username, password: password })
        client
            .login()
            .then((e) => {
                console.log('-----------1--------------', e)
                res.status(400).json({ message: e });
            })
            .catch((e) => {
                console.log('------------2-------------', e)
                res.status(400).json({ message: e });
            })*/
    }

    static async private_register(req, res, redis) {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Missing Parameters' });

        let r = await redis.get(`user_${email}`);
        if (r) return res.status(400).json({ message: 'User Already Exists' });

        r = await redis.set(`user_${email}`, JSON.stringify({
            email: email,
            password: password,
            pricing: 'premieum',
            regist_date: Date.now(),
            threads: [],
            proxies: ["http://user-default:XVIWM27mquqx@resi.proxiware.com:8080"]
        }));

        if (r) {
            try {
                const users = await redis.keys('user_*');

                const embed = {
                    embeds: [
                        {
                            title: 'New User | Agency Tool',
                            description: `${email} has registered!`,
                            fields: [
                                {
                                    name: 'Current User Count',
                                    value: `${users.length} Users`,
                                }
                            ],
                        },
                    ],
                }

                await axios.post(webhook, embed);
            } catch { }

            return res.status(200).json({ message: r, user: JSON.stringify({
                email: email,
                password: password,
                pricing: 'trial',
                regist_date: Date.now(),
                threads: [],
                proxies: []
            }) })
        }

        return res.status(500).json({ message: 'Internal Sever Error' })
    }
    static async register(req, res, redis) {
        const { email, password } = req.body;

        if (!email || !password) return res.status(400).json({ message: 'Missing Parameters' });

        let r = await redis.get(`user_${email}`);

        if (r) return res.status(400).json({ message: 'User Already Exists' });

        r = await redis.set(`user_${email}`, JSON.stringify({
            email: email,
            password: password,
            pricing: 'trial',
            regist_date: Date.now(),
            threads: [],
            proxies: ["http://user-default:XVIWM27mquqx@resi.proxiware.com:8080"]
        }));

        if (r) {
            try {
                const users = await redis.keys('user_*');

                const embed = {
                    embeds: [
                        {
                            title: 'New User | Agency Tool',
                            description: `${email} has registered!`,
                            fields: [
                                {
                                    name: 'Current User Count',
                                    value: `${users.length} Users`,
                                }
                            ],
                        },
                    ],
                }

                await axios.post(webhook, embed);
            } catch { }

            return res.status(200).json({ message: r, user: JSON.stringify({
                email: email,
                password: password,
                pricing: 'trial',
                regist_date: Date.now(),
                threads: [],
                proxies: []
            }) })
        }

        return res.status(500).json({ message: 'Internal Sever Error' })
    }

    static async login(req, res, redis) {
        const { email, password } = req.body;

        if (!email || !password) return res.status(400).json({ message: 'Missing Parameters' });

        let r = await redis.get(`user_${email}`);

        if (r) {
            r = JSON.parse(r);
            if (r.password == password) {
                return res.status(200).json({ message: 'Login Successful', user: JSON.stringify(r) })
            } else {
                return res.status(400).json({ message: 'Invalid Password' })
            }
        }
        return res.status(500).json({ message: 'Internal Sever Error' })
    }

    static async get_threads(req, res, redis) {
        const { email } = req.body;

        if (!email) return res.status(400).json({ message: 'Missing Parameters' });

        let r = await redis.get(`user_${email}`);

        if (r) {
            // // Import the IO
            // const io = require('../index');
            // io.emit('welcome', 'Welcome from the worker!');

            return res.status(200).json({
                message: 'OK',
                data: JSON.parse(r).threads
            })
        }

        return res.status(500).json({ message: 'Internal Sever Error' })
    }

    static async delete_user(req, res, redis) {
        const { email } = req.body;

        if (!email) return res.status(400).json({ message: 'Missing Parameters' });

        let r = await redis.del(`user_${email}`);

        if (r == 1) {
            return res.status(200).json({ message: 'OK' })
        }

        return res.status(500).json({ message: 'Internal Sever Error' })
    }

    static async reset_password(req, res, redis) {
        const { email, password, new_password } = req.body;

        if (!email || !password || !new_password) return res.status(400).json({ message: 'Missing Parameters' });

        let r = await redis.get(`user_${email}`);

        if (r) {
            r = JSON.parse(r);

            if (r.password == password) {
                r.password = new_password;

                r = redis.set(`user_${email}`, JSON.stringify(r));

                if (r) {
                    return res.status(200).json({ message: 'OK' })
                }

                return res.status(500).json({ message: 'Internal Sever Error' })
            }

            return res.status(401).json({ message: 'Invalid Password' })
        }

        return res.status(500).json({ message: 'Internal Server Error' })
    }

    static async import_proxies(req, res, redis) {
        const { email, proxies } = req.body;
        if (!email || !proxies) return res.status(400).json({ message: 'Missing Parameters' });

        let r = await redis.get(`user_${email}`);

        if (r) {
            var data = JSON.parse(r);

            data.proxies = proxies;

            r = redis.set(`user_${email}`, JSON.stringify(data));

            if (r) {
                return res.status(200).json({
                    message: 'OK',
                    proxy_data: {
                        total: proxies.length,
                        hosts: proxies.map((proxy) => { proxy.split(':')[0] }),
                        ports: proxies.map((proxy) => { proxy.split(':')[1] }),
                        usernames: proxies.map((proxy) => { proxy.split(':')[2] }),
                        passwords: proxies.map((proxy) => { proxy.split(':')[3] })
                    }
                })
            }

            return res.status(500).json({ message: 'Internal Sever Error' })
        }
    }

    static async export_proxies(req, res, redis) {
        const { email } = req.body;

        if (!email) return res.status(400).json({ message: 'Missing Parameters' });

        let r = await redis.get(`user_${email}`);

        if (r) {
            var data = JSON.parse(r);

            return res.status(200).json({
                message: 'OK',
                proxies: data.proxies
            })
        }

        return res.status(500).json({ message: 'Internal Sever Error' })
    }

    static async protected_register(req, res, redis) {
        const { email, password } = req.body;

        if (!email || !password) return res.status(400).json({ message: 'Missing Parameters' });

        let r = await redis.get(`user_${email}`);

        if (r) return res.status(400).json({ message: 'User Already Exists' });

        let emailValid = false;

        const jsonData = fs.readFileSync('data.json', 'utf8');
        const data = JSON.parse(jsonData);

        for (const key in data) {
            if (data.hasOwnProperty(key) && data[key] === email) {
                emailValid = true;
                break;
            }
        }

        if (emailValid) {
            r = await redis.set(`user_${email}`, JSON.stringify({
                email: email,
                password: password,
                threads: [],
                proxies: []
            }));

            if (r) {
                try {
                    const users = await redis.keys('user_*');

                    const embed = {
                        embeds: [
                            {
                                title: 'New User | Agency Tool',
                                description: `${email} has registered!`,
                                fields: [
                                    {
                                        name: 'Current User Count',
                                        value: `${users.length} Users`,
                                    }
                                ],
                            },
                        ],
                    }

                    await axios.post(webhook, embed);
                } catch { }

                const index = data.indexOf(email);

                if (index !== -1) {
                    emailList.splice(index, 1);
                }

                fs.writeFileSync('data.json', JSON.stringify(data));

                return res.status(200).json({ message: r })
            }
        }

        return res.status(500).json({ message: 'Internal Sever Error' })
    }
}

module.exports = Users;