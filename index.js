const fastify = require('fastify')();
const helmet = require('fastify-helmet');
const TSLibrary = require('./tsLib');
const path = require('path');
const _ = require('lodash');
const RSS = require('rss');
const url = require('url');
const ProgressBar = require('progress');
//const telegram = require('./telegram');
const telegraf = require('./telegraf');

const io = require('socket.io')(fastify.server);

fastify.register(helmet);

const ts = new TSLibrary({
	ip: process.env.TSVSERVERIP || '127.0.0.1',
	port: process.env.TSVSERVERPORT || 10011,
	username: process.env.TSVSERVERUSERNAME || 'serveradmin',
	password: process.env.TSVSERVERPASSWORD || '',
	server: process.env.TSVSERVER || 1,
	mongodb: process.env.TSVMONGO || "mongodb://localhost/teamspeak",
	cache: process.env.TSVCACHE || 1000 * 120
});

const refreshTime = process.env.TSPOLLINGTIME ? parseInt(process.env.TSPOLLINGTIME) : 500;

let bar;

io.on('connection', socket => {
	console.log("Socket connection ->", socket.conn.remoteAddress);
});

ts.on('indexProgress', ({count, current, lastClient}) => {
	if (!bar) bar = new ProgressBar('Indexing clients [:bar] :percent :etas ETA Indexed: :last', {total: count});
	bar.tick(1, {
		"last": lastClient
	});
});

ts.on('indexFinished', () => {
	bar = null;
	console.log("Finished indexing clients!");
});

ts.on('update', async () => {
	let newData;
	try {
		newData = await ts.getChannelTree();
	} catch(e) {
		console.error(e);
		setTimeout(refreshData, 800);
	}
	if (newData) {
		io.emit('update', newData);
	} else {
		io.emit('updateYourself');
	}
});

ts.on('left', data => {
	io.emit('left', data);
});

ts.on('join', data => {
	io.emit('join', data);
});

async function online() {
	return await ts.getOnlineClients();
}

async function users() {
	return await ts.User.find({}).exec();
}

async function channel(req, reply) {
	if (req.params['id']) {
		return await ts.getChannelAndUpdateIfRequired(req.params['id']);
	} else {
		reply.code(404).send('Sorry');
	}
}

async function icon(req, reply) {
	if (req.params['id']) {
		try {
			const {meta, stream} = await ts.streamIcon({id: req.params['id']});
			if (meta) {
				reply.type(meta['contentType']).send(stream);
			} else {
				reply.send(stream);
			}
		} catch (e) {
			reply.code(500).send(e);
		}
	} else {
		reply.code(404).send('Sorry');
	}
}

async function avatar(req, reply) {
	if ((req.params['type'] === 'uid' || req.params['type'] === 'dbid') || !req.params['id']) {
		try {
			const {meta, stream} = await ts.streamAvatarFrom(req.params['type'] === 'uid' ? {uid: req.params['id']} : {dbid: req.params['id']});
			if (meta) {
				reply.type(meta['contentType']).send(stream);
			} else {
				reply.send(stream);
			}
		} catch (e) {
			reply.code(500).send(e);
		}
	} else {
		reply.code(404).send('Sorry');
	}
}

async function user(req, reply) {
	if ((req.params['type'] === 'uid' || req.params['type'] === 'dbid') || !req.params['id']) {
		const user = await ts.updateUser(req.params['type'] === 'uid' ? {uid: req.params['id']} : {dbid: req.params['id']});
		reply.send(JSON.parse(JSON.stringify(user)));
	} else {
		reply.code(404).send('Sorry');
	}
}

async function channelTree() {
	return await ts.getChannelTree();
}

fastify.get('/avatar/:type/:id', avatar);

fastify.get('/user/:type/:id', user);

fastify.get('/user/', online);

fastify.get('/user', online);

fastify.get('/online', online);

fastify.get('/online/', online);

fastify.get('/users', users);

fastify.get('/users/', users);

fastify.get('/channel/:id', channel);

fastify.get('/icon/:id', icon);

if (process.env.FEEDURL && process.env.FEEDSITEURL && process.env.FEEDTITLE) {
	async function feed(req, reply) {
		const feed = new RSS({
			ttl: 1,
			pubDate: new Date(),
			title: process.env.FEEDTITLE,
			feed_url: process.env.FEEDURL,
			site_url: process.env.FEEDSITEURL
		});
		const logs = await ts.Log.find({}).sort({date: 'asc'}).limit(500).exec();
		const u = url.parse(process.env.FEEDURL);
		for (let log of logs) {
			const user = await ts.getUser({uid: log.meta.uid});
			let meta;
			if (user['hasAvatar']) {
				meta = await new Promise((resolve, reject) => {
					ts.gfs.files.find({filename: `/0/avatar_${user['avatarID']}`}).toArray((err, files) => {
						if (err) return reject(err);
						resolve(files[0]);
					});
				});
			}
			console.log(meta);
			feed.item({
				title: log.message,
				description: `${user['nickname']} already joined ${user['connections']} times.`,
				guid: log._id,
				date: log.date,
				url: `${u.protocol}//${u.hostname}:${u.port || (u.protocol === 'https:' ? 443 : 80)}/user/uid/${log.meta.uid}`,
				enclosure: {
					url: user['hasAvatar'] ? `${u.protocol}//${u.hostname}:${u.port || (u.protocol === 'https:' ? 443 : 80)}/avatar/dbid/${user['dbid']}` : undefined,
					type: meta && meta.hasOwnProperty('contentType') ? meta['contentType'] : undefined,
					size: meta && meta.hasOwnProperty('length') ? meta['length'] : undefined,
				},
				custom_elements: [
					{'dbid': user['dbid']},
					{'country': user['country']},
					{'uid': user['uid']},
					{'nickname': user['nickname']}
				]
			});
		}
		reply.type('application/rss+xml');
		return feed.xml();
	}

	fastify.get('/feed', feed);
}

fastify.get('/channelTree', channelTree);

fastify.register(require('fastify-static'), {
	root: path.join(__dirname, 'public'),
});

ts.login().then(ts.indexClients).then(() => {
	let lastData;

	async function refreshData() {
		let newData;
		try {
			newData = await ts.getChannelTree();
		} catch(e) {
			console.error(e);
			setTimeout(refreshData, refreshTime);
		}

		if (!_.isEqual(newData, lastData)) {
			lastData = newData;
			io.emit('update', newData);
		}
		setTimeout(refreshData, refreshTime);
	}

	setTimeout(refreshData, refreshTime);

	telegraf(ts, fastify);

	fastify.listen(process.env.TSVPORT || 5000, process.env.TSVHOST || "0.0.0.0", err => {
		if (err) {
			console.error(err);
			process.exit(1);
		}
		console.log(`Listen on ${process.env.TSVHOST || "0.0.0.0"}:${process.env.TSVPORT || 5000}`);
	});
}).catch(console.error);