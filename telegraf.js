const Telegraf = require('telegraf');
const url = require('url');

function makeid() {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (var i = 0; i < 30; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
}

/**
 *
 * @param {TSLib} ts
 * @param {FastifyInstance} fastify
 */
module.exports = (ts, fastify) => {

	if (!process.env.TELEGRAMTOKEN || !process.env.TELEGRAMBASEURL) return;

	const uri = url.parse(process.env.TELEGRAMBASEURL);
	const pathname = '/' + makeid();
	uri.pathname = pathname;
	const webhook = url.format(uri);


	const bot = new Telegraf(process.env.TELEGRAMTOKEN, { telegram: { webhookReply: false} });

	bot.start(async ctx => {
		const chatID = ctx.message.chat.id;
		const message = await ctx.replyWithMarkdown('***Processing request...***');
		try {
			await ts.Chat({
				sendFeed: true,
				chatID: chatID
			}).save();
		} catch (e) {
			let string = `*Error:*\n`;
			string += e;
			await bot.telegram.editMessageText(chatID, message.message_id, undefined, string, {parse_mode: 'Markdown'});
			return;
		}
		await bot.telegram.editMessageText(chatID, message.message_id, undefined, 'Successfully.');
	});

	bot.command('remove', async ctx => {
		const chatID = ctx.message.chat.id;
		const message = await ctx.replyWithMarkdown('***Processing request...***');
		try {
			await ts.Chat.findOneAndRemove({chatID: chatID}).exec();
		} catch (e) {
			let string = `*Error:*\n`;
			string += e;
			await bot.telegram.editMessageText(chatID, message.message_id, undefined, string, {parse_mode: 'Markdown'});
			return;
		}
		await bot.telegram.editMessageText(chatID, message.message_id, undefined, 'Successfully.');
	});

	bot.command('online', async ctx => {
		const chatID = ctx.message.chat.id;
		const message = await ctx.replyWithMarkdown('***Processing request...***');
		try {
			const users = await ts.getOnlineClients();
			const string = `Currently online: <b>${users.length}</b>\n`;
			const usernames = [];
			for (const user of users) {
				const groups = [];
				for (const group of user.groups) {
					groups.push('\[' + group['name'] + '\]');
				}
				const groupString = groups.join('');
				usernames.push(`${groupString} ${user['nickname']} \(${user['dbid']}\)`);
			}
			const finalString = `${string}${usernames.join('\n')}`;
			await bot.telegram.editMessageText(chatID, message.message_id, undefined, finalString, {parse_mode: 'HTML'});
		} catch (e) {
			let string = `*Error:*\n`;
			string += e;
			await bot.telegram.editMessageText(chatID, message.message_id, undefined, string, {parse_mode: 'Markdown'});
		}
	});

	bot.command('list', async ctx => {
		const chatID = ctx.message.chat.id;
		const message = await ctx.replyWithMarkdown('***Processing request...***');
		const text = ctx.update.message.text;
		const args = text.split(' ');
		const pageString = args[1] || '1';
		try {
			const limit = 100;
			let page = 1;
			try {
				page = parseInt(pageString) ? parseInt(pageString) : 1;
			} catch (e) {}
			const count = await ts.User.count({});
			const pages = Math.ceil(count / limit);
			const offset = (page - 1) * limit;
			const users = await ts.User.find({}).sort({dbid: 'asc'}).skip(offset).limit(limit).exec();
			let string = "";
			string += `Page <b>${page}</b> of <b>${pages}</b>\n`;
			string += `Display <b>${users.length}</b> of <b>${count}</b> users.\n`;
			string += '<b>===========================</b>\n';
			const usernames = [];
			for (const user of users) {
				const groups = [];
				for (const group of user.groups) {
					groups.push('\[' + group['name'] + '\]');
				}
				const groupString = groups.join('');
				usernames.push(`${groupString} ${user['nickname']} \(${user['dbid']}\)`);
			}
			string += usernames.join('\n');
			string += '\n<b>===========================</b>\n';
			string += `End of page <b>${page}</b>`;
			await bot.telegram.editMessageText(chatID, message.message_id, undefined, string, {parse_mode: 'HTML'});
		} catch (e) {
			let string = `*Error:*\n`;
			string += e;
			await bot.telegram.editMessageText(chatID, message.message_id, undefined, string, {parse_mode: 'Markdown'});
		}
	});

	ts.on('join', async user => {
		const chats = await ts.Chat.find({}).exec();
		if (!chats) return;
		for (let chat of chats) {
			const message = await bot.telegram.sendMessage(chat.chatID, `***${user['nickname']}*** joined the server.`, {parse_mode: "Markdown"});
			if (user['hasAvatar']) {
				const u = url.parse(process.env.TELEGRAMBASEURL);
				u.pathname = `/avatar/dbid/${user['dbid']}`;
				await bot.telegram.sendPhoto(chat.chatID, url.format(u), {
					reply_to_message_id: message.message_id
				});
			}
		}
	});

	ts.on('left', async user => {
		const chats = await ts.Chat.find({}).exec();
		if (!chats) return;
		for (let chat of chats) {
			const message = await bot.telegram.sendMessage(chat.chatID, `***${user['nickname']}*** left the server.`, {parse_mode: "Markdown"});
			if (user['hasAvatar']) {
				const u = url.parse(process.env.TELEGRAMBASEURL);
				u.pathname = `/avatar/dbid/${user['dbid']}`;
				await bot.telegram.sendPhoto(chat.chatID, url.format(u), {
					reply_to_message_id: message.message_id
				});
			}
		}
	});


	if (process.env.NODE_ENV === 'production' && !process.env.TELEGRAMPOLLING) {
		fastify.use(bot.webhookCallback(pathname));
		bot.telegram.setWebhook(webhook);
		console.log("Start telegram bot with webhook url: ", webhook);
	} else {
		bot.telegram.deleteWebhook().then(() => {
			bot.startPolling();
			console.log("Start telegram bot with polling.");
		});
	}

};