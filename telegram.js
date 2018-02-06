const TelegramBot = require('node-telegram-bot-api');
const url = require('url');

/**
 *
 * @param {TSLib} ts
 */
module.exports = ts => {
	if (!process.env.TELEGRAMTOKEN || !process.env.TELEGRAMBASEURL) return;

	console.log("Token: ", process.env.TELEGRAMTOKEN);

	const bot = new TelegramBot(process.env.TELEGRAMTOKEN, {
		polling: {
			interval: process.env.TELEGRAMPOLLINGINTERVAL || 500,
			autoStart: true
		}
	});

	bot.onText(/\/start/, async (msg, match) => {
		const m = await bot.sendMessage(msg.chat.id, `***Processing request...***`, {
			parse_mode: "Markdown"
		});
		try {
			await ts.Chat({
				sendFeed: true,
				chatID: msg.chat.id,
			}).save();
		} catch (e) {
			await bot.editMessageText(`***@${msg.from.hasOwnProperty('username') ? msg.from.username : msg.from.first_name}*** an error occurred while adding your chat to the list.\n ***Error:***\n ${e}`, {
				message_id: m['message_id'],
				parse_mode: "Markdown",
				chat_id: msg.chat.id
			});
			return;
		}
		await bot.editMessageText(`***@${msg.from.hasOwnProperty('username') ? msg.from.username : msg.from.first_name}*** your chat was added to the list.`, {
			message_id: m['message_id'],
			parse_mode: "Markdown",
			chat_id: msg.chat.id
		});
	});

	bot.onText(/\/remove/, async (msg, match) => {
		const m = await bot.sendMessage(msg.chat.id, `***Processing request...***`, {
			parse_mode: "Markdown"
		});
		try {
			await ts.Chat.findOneAndRemove({chatID: msg.chat.id}).exec();
		} catch (e) {
			await bot.editMessageText(`***@${msg.from.hasOwnProperty('username') ? msg.from.username : msg.from.first_name}*** an error occurred while remove your chat from the list.\n ***Error:***\n ${e}`, {
				message_id: m['message_id'],
				parse_mode: "Markdown",
				chat_id: msg.chat.id
			});
			return;
		}
		await bot.editMessageText(`***@${msg.from.hasOwnProperty('username') ? msg.from.username : msg.from.first_name}*** your chat was removed from the list.`, {
			message_id: m['message_id'],
			parse_mode: "Markdown",
			chat_id: msg.chat.id
		});
	});

	bot.onText(/\/help/, (msg) => {
		bot.sendMessage(msg.chat.id, `*HELP:*
		*/start* Add your chat to the feed list
		*/remove* Remove your chat from the feed list`, {parse_mode: "Markdown"});
	});

	bot.onText(/\/online|\/o/, async (msg) => {
		const m = await bot.sendMessage(msg.chat.id, `***Processing request...***`, {parse_mode: "Markdown"});
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
			await bot.editMessageText(finalString, {
				message_id: m['message_id'],
				parse_mode: "HTML",
				chat_id: msg.chat.id
			});
		} catch (e) {
			await bot.editMessageText(`***@${msg.from.hasOwnProperty('username') ? msg.from.username : msg.from.first_name}*** an error occurred while getting online clients.\n ***Error:***\n ${e}`, {
				message_id: m['message_id'],
				parse_mode: "Markdown",
				chat_id: msg.chat.id
			});
		}
	});

	async function list(msg, match) {
		const m = await bot.sendMessage(msg.chat.id, `***Processing request...***`, {parse_mode: "Markdown"});
		try {
			const limit = 100;
			let page = 1;
			try {
				page = parseInt(match[1]) ? parseInt(match[1]) : 1;
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
			await bot.editMessageText(string, {
				message_id: m['message_id'],
				parse_mode: "HTML",
				chat_id: msg.chat.id
			});
		} catch (e) {
			await bot.editMessageText(`***@${msg.from.hasOwnProperty('username') ? msg.from.username : msg.from.first_name}*** an error occurred while getting clients.\n ***Error:***\n ${e}`, {
				message_id: m['message_id'],
				parse_mode: "Markdown",
				chat_id: msg.chat.id
			});
		}
	}

	bot.onText(/\/list (.+)/, list);
	bot.onText(/\/list$/, list);

	ts.on('join', async user => {
		const chats = await ts.Chat.find({}).exec();
		if (!chats) return;
		for (let chat of chats) {
			if (!user['hasAvatar']) {
				bot.sendMessage(chat.chatID, `***${user['nickname']}*** joined the server.`, {parse_mode: "Markdown"});
			} else {
				const u = url.parse(process.env.TELEGRAMBASEURL);
				u.pathname = `/avatar/dbid/${user['dbid']}`;
				bot.sendMessage(chat.chatID, `[${user['nickname']}'s avatar](${url.format(u)})\n***${user['nickname']}*** joined the server.`, {parse_mode: "Markdown"});
			}
		}
	});

	ts.on('left', async user => {
		const chats = await ts.Chat.find({}).exec();
		if (!chats) return;
		for (let chat of chats) {
			if (!user['hasAvatar']) {
				bot.sendMessage(chat.chatID, `***${user['nickname']}*** left the server.`, {parse_mode: "Markdown"});
			} else {
				const u = url.parse(process.env.TELEGRAMBASEURL);
				u.pathname = `/avatar/dbid/${user['dbid']}`;
				bot.sendMessage(chat.chatID, `[${user['nickname']}'s avatar](${url.format(u)})\n***${user['nickname']}*** left the server.`, {parse_mode: "Markdown"});
			}
		}
	});
};
