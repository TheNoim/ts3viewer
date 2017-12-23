const fastify = require('fastify')();
const helmet = require('fastify-helmet');
const TSLibrary = require('./tsLib');
const path = require('path');
const _ = require('lodash');

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


io.on('connection', socket => {
	console.log("Socket connection!");
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

let lastData;

async function refreshData() {
	let newData;
	try {
		newData = await ts.getChannelTree();
	} catch(e) {
		console.error(e);
		setTimeout(refreshData, 500);
	}

	if (!_.isEqual(newData, lastData)) {
		lastData = newData;
		io.emit('update', newData);
	}
	setTimeout(refreshData, 500);
}

setTimeout(refreshData, 500);

fastify.get('/avatar/:type/:id', async (req, reply) => {
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
});


fastify.get('/user/:type/:id', async (req, reply) => {
	if ((req.params['type'] === 'uid' || req.params['type'] === 'dbid') || !req.params['id']) {
		const user = await ts.updateUser(req.params['type'] === 'uid' ? {uid: req.params['id']} : {dbid: req.params['id']});
		reply.send(JSON.parse(JSON.stringify(user)));
	} else {
		reply.code(404).send('Sorry');
	}
});

fastify.get('/user/', async (req, reply) => {
	return await ts.getOnlineClients();
});

fastify.get('/icon/:id', async (req, reply) => {
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
});

fastify.get('/channelTree', async (req, reply) => {
	return await ts.getChannelTree();
});

fastify.register(require('fastify-static'), {
	root: path.join(__dirname, 'public'),
});

ts.login().then(() => {
	fastify.listen(process.env.TSVPORT || 5000, process.env.TSVHOST || "0.0.0.0", err => {
		if (err) {
			console.error(err);
			process.exit(1);
		}
		console.log(`Listen on ${process.env.TSVHOST || "0.0.0.0"}:${process.env.TSVPORT || 5000}`);
	});
});