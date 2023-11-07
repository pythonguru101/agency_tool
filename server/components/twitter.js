const { exec, fork, execSync } = require("child_process");
const puppeteer = require("puppeteer");
const proxyChain = require('proxy-chain');

const user_email = "yangg3800@gmail.com";
const user_handle = "web_sudo"; //either your handle or phone number
const password = "Password";

class Twitter {
	static async verify_account(req, res, redis) {
		const { twitter_user, current_user } = req.body;
		const oldProxyUrl = 'http://user-default:XVIWM27mquqx@resi.proxiware.com:8080';
    	const newProxyUrl = await proxyChain.anonymizeProxy(oldProxyUrl);
		
		//'http://user-default_geo-us:XVIWM27mquqx@resi.proxiware.com:8080';
		//`--proxy-server=${newProxyUrl}`
		//resi.proxiware.com:8080:user-default_geo-ca~Ontario~Ottawa:XVIWM27mquqx
		const browser = await puppeteer.launch({
			headless: 'new',
			args: [
				'--no-sandbox',
				`--proxy-server=${newProxyUrl}`
			]
		});

		let page;
		let totalAttempt = 0
		async function verify_twitter_account() {
			try {
				page = await browser.newPage();
				await page.goto("https://twitter.com/i/flow/login", {waitUntil: 'load', timeout: 0});
				await page.waitForTimeout(5000);
			
				// Select the user input
				await page.waitForSelector("[autocomplete=username]");
				await page.type("input[autocomplete=username]", twitter_user.useremail, { delay: 50 });
				console.log(`___________ login with ${twitter_user.useremail} ___________`);
				// Press the Next button
				await page.evaluate(() =>
					document.querySelectorAll('div[role="button"]')[2].click()
				);
				await page.waitForTimeout(1500);
				console.log('________________ Started browser and email is inputted _______________')

				const extractedText = await page.$eval("*", (el) => el.innerText);
	
				if (extractedText.includes("Enter your phone number or username")) {
					await page.waitForSelector("[autocomplete=on]");
					await page.type("input[autocomplete=on]", twitter_user.username, { delay: 50 });
					await page.evaluate(() =>
						document.querySelectorAll('div[role="button"]')[1].click()
					);
					await page.waitForNetworkIdle({ idleTime: 1000 });
				}

				//await page.waitForTimeout(5000);
				await page.waitForSelector('[autocomplete="current-password"]');
				await page.type('[autocomplete="current-password"]', twitter_user.password, { delay: 50 });
			
				// Press the Login button
				await page.evaluate(() =>
					document.querySelectorAll('div[role="button"]')[2].click()
				);
				await page.waitForTimeout(4000);
				console.log(`___________ login succeeded ${twitter_user.useremail} ___________`, page.url());
				
				if (page.url() == 'https://twitter.com/home') {
					res.status(200).json({result: true})
				} else {
					res.status(200).json({result: false})
				}
				await browser.close();
				return true
	
			} catch(error) {
				page.close()
				totalAttempt += 1
				console.log('-----------error happened-----------------', error)
				if (totalAttempt < 3) {
					await verify_twitter_account()
				} else {
					res.status(200).json({ result: false });
					return false
				}
			}
		}

		await verify_twitter_account()
	}

	static async create_lead(req, res, redis) {
		const { lead_name, lead_from, lead_type, twitter_user, current_user } = req.body;
		
		let r = await redis.get(`user_${current_user}_twitter`);
		let redis_user = JSON.parse(r);

		if (!redis_user) {
			redis_user = {}
		}
		if (!redis_user['leads']?.length) {
			redis_user['leads'] = []
		}
		const temp = {
			leads: [],
			lead_name,
			lead_type,
			lead_from,
			status: 'created',
			account: twitter_user.useremail,
			created: new Date().toJSON().slice(0, 10)
		}

		redis_user['leads'].push(temp)

		r = await redis.set(`user_${current_user}_twitter`, JSON.stringify(redis_user));
		
		return res.status(200).json(redis_user)
	}
	
	static async get_lead(req, res, redis) {
		const { current_user } = req.body

		const r = await redis.get(`user_${current_user}_twitter`);
		const user = JSON.parse(r);
		
		return res.status(200).json(user)
	}

	static async run_lead(req, res, redis) {
		const { lead_name, twitter_user, current_user } = req.body;

		let lead = {}
		let r = await redis.get(`user_${current_user}_twitter`);
		let main_r = await redis.get(`user_${current_user}`);
		let main_user = JSON.parse(main_r);
		let redis_user = JSON.parse(r);
		let lead_index = 0

		if (!redis_user) {
			redis_user = {}
		}
		if (!redis_user['leads']) {
			redis_user['leads'] = []
		}

		for (let i in redis_user['leads']) {
			if (redis_user['leads'][i]['lead_name'] === lead_name) {
				lead = redis_user['leads'][i]
				lead_index = i
				redis_user['leads'][i]['status'] = 'run'
			}
		}
		r = await redis.set(`user_${current_user}_twitter`, JSON.stringify(redis_user));
		res.status(200).json(redis_user)

		const browser = await puppeteer.launch({
			headless: 'new',
			args: ['--no-sandbox']
		});
		let page;
		let totalAttempt = 0
		async function run_lead_function() {
			try {
				page = await browser.newPage();
				console.log('___________ starting browser ___________');
				await page.waitForNetworkIdle({ idleTime: 1500 });
				await page.goto("https://twitter.com/i/flow/login", {waitUntil: 'load', timeout: 0});
				await page.waitForNetworkIdle({ idleTime: 2000 });
	
				// Select the user input
				await page.waitForSelector("[autocomplete=username]");
				await page.type("input[autocomplete=username]", twitter_user.useremail, { delay: 50 });
				console.log(`___________ login with ${twitter_user.useremail} ___________`);
				// Press the Next button
				await page.evaluate(() =>
					document.querySelectorAll('div[role="button"]')[2].click()
				);
				await page.waitForNetworkIdle({ idleTime: 1500 });
	
				const extractedText = await page.$eval("*", (el) => el.innerText);
	
				if (extractedText.includes("Enter your phone number or username")) {
					await page.waitForSelector("[autocomplete=on]");
					await page.type("input[autocomplete=on]", twitter_user.username, { delay: 50 });
					await page.evaluate(() =>
						document.querySelectorAll('div[role="button"]')[1].click()
					);
					await page.waitForNetworkIdle({ idleTime: 1000 });
				}
	
				await page.waitForSelector('[autocomplete="current-password"]');
				await page.type('[autocomplete="current-password"]', twitter_user.password, { delay: 50 });
	
				// Press the Login button
				await page.evaluate(() =>
					document.querySelectorAll('div[role="button"]')[2].click()
				);
				await page.waitForNetworkIdle({ idleTime: 1000 });
				console.log(`___________ login succeeded ${twitter_user.useremail} ___________`, page.url());
				if (lead['lead_type'] === 'followings') {
					await page.goto(`https://twitter.com/${lead['lead_from']}/following`, {waitUntil: 'load', timeout: 0});
				}
				if (lead['lead_type'] === 'followers') {
					await page.goto(`https://twitter.com/${lead['lead_from']}/followers`, {waitUntil: 'load', timeout: 0});
				}
				await page.waitForSelector('.css-901oao.css-16my406.r-poiln3.r-bcqeeo.r-qvutc0');
				await page.waitForNetworkIdle({ idleTime: 1000 });
				// Either close the browser and kill the fun, OR make a baby bot to tweet instead of you
	
				const followings = {}
				let prev = []
				let repeat = 1
				if (main_user?.pricing !== 'trial') {
					repeat = 30
				}
				
				for (let i=0; i<repeat; i++) {
					const tweets = await page.$$eval('.css-901oao.css-1hf3ou5.r-18u37iz.r-37j5jr.r-1wvb978.r-a023e6.r-16dba41.r-rjixqe.r-bcqeeo.r-qvutc0', tweets => {
						return tweets.map(tweet => tweet.textContent);
					});
					if (prev?.length == tweets?.length && prev[0] == tweets[0]) {
						break
					}
					const elements = await page.$$('.css-901oao.css-1hf3ou5.r-18u37iz.r-37j5jr.r-1wvb978.r-a023e6.r-16dba41.r-rjixqe.r-bcqeeo.r-qvutc0')
	
					for (let j in tweets) {
						followings[tweets[j]] = tweets[j]
					}
					
					//await page.keyboard.press('End');
					await elements[elements?.length - 1].scrollIntoView()
					await page.waitForNetworkIdle({ idleTime: 1000 });
					prev = tweets
				}
				redis_user['leads'][lead_index]['leads'] = Object.keys(followings)
	
				console.log(`___________ scraping with ${twitter_user.useremail} is succeeded ___________`);
			
				await browser.close();
				redis_user['leads'][lead_index]['status'] = 'done'

				return true
	
			} catch(error) {
				page.close()
				totalAttempt += 1
				console.log('-----------error happened-----------------', error)
				if (totalAttempt < 5) {
					await run_lead_function()
				} else {
					redis_user['leads'][lead_index]['status'] = 'fatal_error_' + totalAttempt
					return false
				}
			}
		}

		await run_lead_function()
		console.log('------------ Finished ------------')
		r = await redis.set(`user_${current_user}_twitter`, JSON.stringify(redis_user));
		return
	}

	static async create_campaign(req, res, redis) {
		const { campaign_name, campaign_leads, campaign_msg, current_user, twitter_user } = req.body;

		let r = await redis.get(`user_${current_user}_twitter`);
		let user = JSON.parse(r);

		if (!user) {
			user = {}
		}
		if (!user['campaigns']) {
			user['campaigns'] = {}
		}
		user['campaigns'][campaign_name] = {}
		user['campaigns'][campaign_name]['campaign_leads'] = campaign_leads
		user['campaigns'][campaign_name]['campaign_msg'] = campaign_msg
		user['campaigns'][campaign_name]['account'] = twitter_user.useremail
		user['campaigns'][campaign_name]['status'] = 'created'
		user['campaigns'][campaign_name]['sent'] = ''
		user['campaigns'][campaign_name]['sent_count'] = 0
		user['campaigns'][campaign_name]['created'] = new Date().toJSON().slice(0, 10)

		r = await redis.set(`user_${current_user}_twitter`, JSON.stringify(user));
		
		return res.status(200).json(user)
	}

	static async kill_campaign(req, res, redis) {
		const { campaign_name, current_user, twitter_user } = req.body

		let r = await redis.get(`user_${current_user}_twitter`);
		let user = JSON.parse(r);

		user['campaigns'][campaign_name]['status'] = 'stop'
		r = await redis.set(`user_${current_user}_twitter`, JSON.stringify(user));
		res.status(200).json(user)
	}

	static async run_campaign(req, res, redis) {
		const { campaign_name, current_user, twitter_user } = req.body

		let r = await redis.get(`user_${current_user}_twitter`);
		let user = JSON.parse(r);

		user['campaigns'][campaign_name]['status'] = 'run'
		//user['campaigns'][campaign_name]['sent'] = ''
		//user['campaigns'][campaign_name]['sent_count'] = 0
		r = await redis.set(`user_${current_user}_twitter`, JSON.stringify(user));
		res.status(200).json(user)

		const user_leads = user['campaigns'][campaign_name]['campaign_leads'].split(',')

		let leads = []
		for (let i in user_leads) {
			//leads = {...leads, ...user['leads'][user_leads[i]]}
		}
		for (let i in user['leads']) {
			if (user_leads.includes(user['leads'][i].lead_name)) {
				leads = leads.concat(user['leads'][i].leads)
			}
		}
		
		const browser = await puppeteer.launch({
			headless: 'new',
			args: ['--no-sandbox']
		});
		let page;

		let totalAttempt = 0
		async function run_campaign_function() {
			try {
				page  = await browser.newPage();
				await page.goto("https://twitter.com/i/flow/login", {waitUntil: 'load', timeout: 0});
				await page.waitForTimeout(5000);
			
				// Select the user input
				await page.waitForSelector("[autocomplete=username]");
				await page.type("input[autocomplete=username]", twitter_user.useremail, { delay: 50 });
				// Press the Next button
				await page.evaluate(() =>
					document.querySelectorAll('div[role="button"]')[2].click()
				);
				await page.waitForTimeout(1500);
				console.log('________________ Started browser and email is inputted _______________')
				const extractedText = await page.$eval("*", (el) => el.innerText);
			
				if (extractedText.includes("Enter your phone number or username")) {
					//await page.waitForSelector("[autocomplete=on]");
					await page.waitForTimeout(10000);
					await page.type("input[autocomplete=on]", twitter_user.username, { delay: 50 });
					await page.evaluate(() =>
						document.querySelectorAll('div[role="button"]')[1].click()
					);
					await page.waitForTimeout(1000);
				}
				
				await page.waitForTimeout(5000);
				//await page.waitForSelector('[autocomplete="current-password"]');
				await page.type('[autocomplete="current-password"]', twitter_user.password, { delay: 50 });
			
				// Press the Login button
				await page.evaluate(() =>
					document.querySelectorAll('div[role="button"]')[2].click()
				);
				await page.waitForTimeout(3000);
				console.log('______________ Login Succeeded _________________', page.url())
				
				const data = leads
				let totalMsg = 0
				for (let i in data) {
					try {
						console.log('__________sending DM to_______', data[i].replace('@',''))

						if (user['campaigns'][campaign_name]['status'] == 'stop') {
							console.log('_____________ stopped by user _____________');
							await browser.close();
							return
						}

						if (i < user['campaigns'][campaign_name]['sent_count']) {
							continue
						}
						user['campaigns'][campaign_name]['sent'] = data[i]
						user['campaigns'][campaign_name]['sent_count'] = i*1+1
						if (data[i].includes('@')) {
							await page.goto(`https://twitter.com/${data[i].replace('@','')}`, {waitUntil: 'load', timeout: 0});
							await page.waitForTimeout(2000);

							const dms = await page.$$('div[data-testid="sendDMFromProfile"]');

							
							const usernames = await page.$$eval('.css-901oao.css-16my406.r-poiln3.r-bcqeeo.r-qvutc0 > .css-901oao.css-16my406.r-poiln3.r-bcqeeo.r-qvutc0', names => {
								return names.map(n => n.textContent);
							});
							const username = usernames[0]
							
							if (!username?.length) {
								continue
							}

							if (dms?.length > 0) {
								await page.evaluate(() => 
									document.querySelectorAll('div[data-testid="sendDMFromProfile"]')[0].click()
								);
							} else {
								continue
							}
							console.log('______________3-sleeping_____________')
							//await page.waitForSelector('div[data-testid="dmComposerTextInputRichTextInputContainer"]');
							await page.waitForTimeout(10000);
							await page.click('div[class="DraftEditor-root"]')
							
							let msg = user['campaigns'][campaign_name]['campaign_msg']
							msg = msg.replace("{{FirstName}}", username.split(' ')[0])
							msg = msg.replace("{{firstname}}", username.split(' ')[0])
							msg = msg.replace("{{Firstname}}", username.split(' ')[0])
							msg = msg.replace("{{firstName}}", username.split(' ')[0])
							msg = msg.replace("{{First Name}}", username.split(' ')[0])
							msg = msg.replace("{{first name}}", username.split(' ')[0])
							msg = msg.replace("{{First name}}", username.split(' ')[0])
							msg = msg.replace("{{first Name}}", username.split(' ')[0])

							await page.type('div[class="DraftEditor-root"]', msg)
							await page.keyboard.press('Enter');

							await page.waitForNetworkIdle({ idleTime: 1000 });
							let newR = await redis.get(`user_${current_user}_twitter`);
							let newUser = JSON.parse(newR);
							user['campaigns'][campaign_name]['status'] = newUser['campaigns'][campaign_name]['status']
							await redis.set(`user_${current_user}_twitter`, JSON.stringify(user));
							console.log('______________sent and sleep 20 seconds_____________')
							await page.waitForTimeout(20000);
						} else {
							continue
						}
						console.log('__________sent DM to_______', data[i].replace('@',''))
					} catch (e) {
						console.log('-------- sending error ----------', e)
					} finally {
						continue
					}
				}

				await browser.close();
				user['campaigns'][campaign_name]['status'] = 'done'
				return true
			} catch(error) {
				page.close()
				totalAttempt += 1
				console.log('---------------------- error happened ----------', error)

				if (totalAttempt < 10) {
					await run_campaign_function()
				} else {
					user['campaigns'][campaign_name]['status'] = 'fatal_error_' + totalAttempt
					return false
				}
			}
		}

		await run_campaign_function()
		console.log('------------ Finished ------------')
		r = await redis.set(`user_${current_user}_twitter`, JSON.stringify(user));
		return

		//user['campaigns'][campaign_name]['status'] = 'run'

		//r = await redis.set(`user_${user_email}_twitter`, JSON.stringify(user));
		
		//return res.status(200).json(user)
	}

	
	static async get_campaign(req, res, redis) {
		const { current_user } = req.body
		const r = await redis.get(`user_${current_user}_twitter`);
		const user = JSON.parse(r);
		
		return res.status(200).json(user)
	}

}


module.exports = Twitter;