const Redis = require('redis');
const express = require('express');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const port = 1590;
const port2 = 1591;

const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 Hours
  max: 2
});

const Users = require('./components/users');
const Threads = require('./components/threads');
const Twitter = require('./components/twitter');
const Stripe = require('./components/stripe');

const redis = Redis.createClient({
  socket: {
    host: 'redis-10615.c257.us-east-1-3.ec2.cloud.redislabs.com',
    port: 10615,
    keepAlive : true,
    reconnectStrategy: (attempts) => {
      console.log(`Redis reconnecting attempt ${attempts}`);
      this.connected = false;
      if (attempts == 1) {
        console.log(`failed to connect to redis. Reconnecting...`);
      }
      return 5000;
    }
  },
  username: 'default',
  password: 'Z5pZMM3k50JFRn42pd0hdGjmaNhm1s1g'
});

// Middleware
app.use(bodyParser.json());

// Enable CORS middleware to allow from any origin
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.set('trust proxy', 50)
// API Endpoints
app.get('/', (req, res) => { res.send('AgencyTool API') });

// User Functions
app.post('/users/login', (req, res) => { Users.login(req, res, redis) });
app.post('/users/register', limiter, (req, res) => { Users.register(req, res, redis) });
app.post('/users/stellar/register/premieum', limiter, (req, res) => { Users.private_register(req, res, redis) });
app.post('/users/threads', (req, res) => { Users.get_threads(req, res, redis) });
app.post('/users/delete', (req, res) => { Users.delete_user(req, res, redis) });
app.post('/users/reset', (req, res) => { Users.reset_password(req, res, redis) });
app.post('/users/verify-ig', (req, res) => { Users.verify_ig(req, res, redis) });
app.post('/users/proxies/import', (req, res) => { Users.import_proxies(req, res, redis) });
app.post('/users/proxies/export', (req, res) => { Users.export_proxies(req, res, redis) });
app.post('/users/protected/register', (req, res) => { Users.protected_register(req, res, redis) });

app.post('/stripe/webhook', (req, res) => {Stripe.webhook(req, res, redis)});

// Thread Functions
app.post('/threads/create', (req, res) => { Threads.create_thread(req, res, redis) });
app.post('/threads/get', (req, res) => { Threads.get_thread(req, res, redis) });
app.post('/threads/input', (req, res) => { Threads.thread_input(req, res, redis) });
app.post('/threads/status', (req, res) => { Threads.thread_status(req, res, redis) });
app.post('/threads/kill', (req, res) => { Threads.kill_thread(req, res, redis) });
app.post('/threads/start', (req, res) => { Threads.start_thread(req, res, redis) });

// Twitter Integration
app.post('/twitter/accounts/verify', (req, res) => { Twitter.verify_account(req, res, redis) });
app.post('/twitter/leads/create', (req, res) => { Twitter.create_lead(req, res, redis) });
app.post('/twitter/leads/run', (req, res) => { Twitter.run_lead(req, res, redis) });
app.post('/twitter/leads/get', (req, res) => { Twitter.get_lead(req, res, redis) });
app.post('/twitter/campaigns/create', (req, res) => { Twitter.create_campaign(req, res, redis) });
app.post('/twitter/campaigns/get', (req, res) => { Twitter.get_campaign(req, res, redis) });
app.post('/twitter/campaigns/run', (req, res) => { Twitter.run_campaign(req, res, redis) });
app.post('/twitter/campaigns/kill', (req, res) => { Twitter.kill_campaign(req, res, redis) });

io.on('connection', (socket) => {
  // Do nothing
});

// Checks
app.listen(port, () => {
  console.log(`[+] Server on port ${port}`)
});

server.listen(port2, () => {
  console.log(`[+] Socket on port ${port2}`)
});

redis.on('ready', () => {
  //Threads.server_start(redis);
  console.log('[+] Redis is ready')
});
redis.on('error', (err) => {
  console.log('---------REDIS ERROR-------------')
  console.log(err)
  //redis.connect();
});

(async () => { await redis.connect() })();

// Export the io object so it can be used in other modules
module.exports = io;