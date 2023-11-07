const { exec, fork, execSync } = require("child_process");

const stripe = require('stripe')('pk_live_51MAJrwJ1NgwaYxOzbOooQcJu3caoUE2hjfiXFrTID9MATPerLY8W9VXFrV5DT9bTrUSeUGIikI4wkwnoHiMJYmwT00dxbZC0Dq');

class Stripe {

	
	static async webhook(req, res, redis) {
		const sig = req.headers['stripe-signature'];

		try {
			if (req.body?.meta?.event_name === 'subscription_payment_success') {
				//console.log('____________________________', req.body)
				const email = req.body?.data?.attributes?.user_email;
				let r = await redis.get(`user_${email}`);
				let redis_user = JSON.parse(r);
				redis_user.pricing = 'premieum';
				redis_user.pricing_detail = req.body;

				r = await redis.set(`user_${email}`, JSON.stringify(redis_user));
			} else if (req.body?.meta?.event_name === 'subscription_expired') {
				const email = req.body?.data?.attributes?.user_email;
				let r = await redis.get(`user_${email}`);
				let redis_user = JSON.parse(r);
				redis_user.pricing = 'trial';
				redis_user.pricing_detail = req.body;

				r = await redis.set(`user_${email}`, JSON.stringify(redis_user));
			} else if (req.body?.meta?.event_name === 'subscription_payment_failed') {
				const email = req.body?.data?.attributes?.user_email;
				let r = await redis.get(`user_${email}`);
				let redis_user = JSON.parse(r);
				redis_user.pricing = 'trial';
				redis_user.pricing_detail = req.body;

				r = await redis.set(`user_${email}`, JSON.stringify(redis_user));
			} else if (req.body?.meta?.event_name === 'subscription_cancelled') {
				const email = req.body?.data?.attributes?.user_email;
				let r = await redis.get(`user_${email}`);
				let redis_user = JSON.parse(r);
				redis_user.pricing = 'trial';
				redis_user.pricing_detail = req.body;

				r = await redis.set(`user_${email}`, JSON.stringify(redis_user));
			} else {
				
			}

		} catch (err) {
			res.status(400).send(`Webhook Error: ${err.message}`);
			return;
		}

		// Handle the event
		/*switch (event.type) {
			case 'payment_intent.succeeded':
			const paymentIntentSucceeded = event.data.object;
			// Then define and call a function to handle the event payment_intent.succeeded
			console.log('-------------------------------', paymentIntentSucceeded)
			break;
			// ... handle other event types
			default:
			console.log(`Unhandled event type ${event.type}`);
		}*/

		// Return a 200 response to acknowledge receipt of the event
		res.send();
	}

}


module.exports = Stripe;