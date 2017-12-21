const fastify = require('fastify')();
const helmet = require('fastify-helmet');
const TSLibrary = require('./tsLib');

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


fastify.get('/avatar/:type/:id', async (req, reply) => {
	if ((req.params['type'] === 'uid' || req.params['type'] === 'dbid') || !req.params['id']) {
		try {
			const user = await ts.getUserAndUpdateIfRequired(req.params['type'] === 'uid' ? {uid: req.params['id']} : {dbid: req.params['id']});
			const {meta, stream} = await ts.streamUserAvatarTo(user);
			if (meta) {
				reply.type(meta['contentType']).send(stream);
			} else {
				reply.send(stream);
			}
		} catch (e) {
			reply.code(500).send(e);
		}
	} else {
		reply.code(404).send(req.params);
	}
});

fastify.get('/channelTree', async (req, reply) => {
	return await ts.getChannelTree();
});

fastify.listen(process.env.TSVPORT || 5000, process.env.TSVHOST || "0.0.0.0", err => {
	if (err) {
		console.error(err);
		process.exit(1);
	}
	console.log(`Listen on ${process.env.TSVHOST || "0.0.0.0"}:${process.env.TSVPORT || 5000}`);
});