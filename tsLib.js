const TeamspeakQuery = require('teamspeak-query');
const net = require('net');
const fs = require('fs');
const moment = require('moment');
const magic = require('stream-mmmagic');
const Queue = require('promise-queue');
const EventEmitter = require('events');

class TSLib extends EventEmitter{

	constructor({ip = '127.0.0.1', port = 10011, username = "serveradmin", password, options = {}, server = 1, mongodb = "mongodb://localhost/teamspeak"}, cache = 1000 * 60) {
		super();
		this.ip = ip;
		this.port = port;
		this.username = username;
		this.password = password;
		this.options = options;
		this.loggedIn = false;
		this.server = server;
		this.databaseConnected = false;
		this.mongoose = require('mongoose');
		this.Grid = require('gridfs-stream');
		this.Grid.mongo = this.mongoose.mongo;
		this.mongoose.Promise = global.Promise;
		this.db = this.mongoose.connection;
		this.mongodb = mongodb;
		this.query = new TeamspeakQuery(this.ip, this.port, this.options);
		this.query.throttle.set('enable', false);
		this.cache = cache;
		this.queue = new Queue(1);
		this._registerDBEvent();
		this._generateDBModels();
	}

	async getUser({uid, dbid}) {
		if (!this.loggedIn) await this.login();
		if (!uid && !dbid) throw new Error("You need to specify uid or dbid!");
		const user = await this.User.findOne(uid ? {uid} : {dbid}).exec();
		if (user) {
			return user;
		} else {
			let id = dbid;
			if (uid && !dbid) {
				const r = await this.query.send('clientgetdbidfromuid', {cluid: uid});
				if (!r['cldbid']) throw new Error(`Can not find client with UID ${uid}.`);
				id = r['cldbid'];
			}
			const r = await this.query.send('clientdbinfo', {cldbid: id});
			if (r['id']) throw new Error(`Can not find client with id ${id}.`);
			const user = await new this.User({
				uid: r['client_unique_identifier'],
				nickname: r['client_nickname'],
				dbid: r['client_database_id'],
				created: new Date(parseInt(r['client_created']) * 1000),
				lastconnected: new Date(parseInt(r['client_lastconnected']) * 1000),
				description: r['client_description'],
				avatarID: r['client_base64HashClientUID'],
				connections: parseInt(r['client_totalconnections']),
				upload: {
					total: parseInt(r['client_total_bytes_uploaded'] || '0'),
					month: parseInt(r['client_month_bytes_uploaded'] || '0')
				},
				download: {
					total: parseInt(r['client_total_bytes_downloaded'] || '0'),
					month: parseInt(r['client_month_bytes_downloaded'] || '0')
				},
				lastIP: r['client_lastip'],
				lastUpdate: new Date(),
				hasAvatar: !!r['client_flag_avatar']
			}).save();
			const isOnline = await this.isClientOnline({uid: user['uid']});
			user['online'] = isOnline !== false;
			if (isOnline !== false) {
				try {
					const currentData = await this.getOnlineClientInfo(isOnline);
					if (currentData.hasOwnProperty('client_country')) user['country'] = currentData['client_country'];
					if (currentData.hasOwnProperty('client_icon_id')) {
						let signedInt = parseInt(currentData['client_icon_id']);
						let unsignedInt;
						if (Math.sign(signedInt) === -1) {
							signedInt = signedInt * -1;
							unsignedInt = 4294967296 - signedInt;
						} else {
							unsignedInt = signedInt;
						}
						user['iconID'] = JSON.stringify(unsignedInt);
					}
					if (currentData.hasOwnProperty('client_away')) user['away'] = currentData['client_away'] === '1';
					if (currentData.hasOwnProperty('client_platform')) user['platform'] = currentData['client_platform'];
					if (currentData.hasOwnProperty('client_version')) user['version'] = currentData['client_version'];
					user['muted'] = {
						input: false,
						output: false
					};
					if (currentData.hasOwnProperty('client_output_muted')) user['muted']['output'] = currentData['client_output_muted'] === '1';
					if (currentData.hasOwnProperty('client_input_muted')) user['muted']['input'] = currentData['client_input_muted'] === '1';
					if (currentData.hasOwnProperty('client_is_recording')) user['recording'] = currentData['client_is_recording'] === '1';
					if (currentData.hasOwnProperty('client_is_channel_commander')) user['channelCommander'] = currentData['client_is_channel_commander'] === '1';
				} catch (e) {
				}
			}
			return await user.save();
		}
	}

	async updateUser(param) {
		const user = await this.getUser(param);
		const r = await this.query.send('clientdbinfo', {cldbid: user['dbid']});
		if (r['id']) throw new Error(`Can not find client with id ${id}.`);
		user['nickname'] = r['client_nickname'];
		user['lastconnected'] = new Date(parseInt(r['client_lastconnected']) * 1000);
		user['description'] = r['client_description'];
		user['avatarID'] = r['client_base64HashClientUID'];
		user['connections'] = parseInt(r['client_totalconnections']);
		user['hasAvatar'] = !!r['client_flag_avatar'];
		user['upload'] = {
			total: parseInt(r['client_total_bytes_uploaded'] || '0'),
			month: parseInt(r['client_month_bytes_uploaded'] || '0')
		};
		user['download'] = {
			total: parseInt(r['client_total_bytes_downloaded'] || '0'),
			month: parseInt(r['client_month_bytes_downloaded'] || '0')
		};
		user['lastIP'] = r['client_lastip'];
		user['lastUpdate'] = new Date();
		const isOnline = await this.isClientOnline({uid: user['uid']});
		user['online'] = isOnline !== false;
		if (isOnline !== false) {
			try {
				const currentData = await this.getOnlineClientInfo(isOnline);
				if (currentData.hasOwnProperty('client_country')) user['country'] = currentData['client_country'];
				if (currentData.hasOwnProperty('client_icon_id')) {
					let signedInt = parseInt(currentData['client_icon_id']);
					let unsignedInt;
					if (Math.sign(signedInt) === -1) {
						signedInt = signedInt * -1;
						unsignedInt = 4294967296 - signedInt;
					} else {
						unsignedInt = signedInt;
					}
					user['iconID'] = JSON.stringify(unsignedInt);
				}
				if (currentData.hasOwnProperty('client_away')) user['away'] = currentData['client_away'] === '1';
				if (currentData.hasOwnProperty('client_platform')) user['platform'] = currentData['client_platform'];
				if (currentData.hasOwnProperty('client_version')) user['version'] = currentData['client_version'];
				user['muted'] = {
					input: false,
					output: false
				};
				if (currentData.hasOwnProperty('client_output_muted')) user['muted']['output'] = currentData['client_output_muted'] === '1';
				if (currentData.hasOwnProperty('client_input_muted')) user['muted']['input'] = currentData['client_input_muted'] === '1';
				if (currentData.hasOwnProperty('client_is_recording')) user['recording'] = currentData['client_is_recording'] === '1';
				if (currentData.hasOwnProperty('client_is_channel_commander')) user['channelCommander'] = currentData['client_is_channel_commander'] === '1';
				if (currentData.hasOwnProperty('client_nickname')) user['nickname'] = currentData['client_nickname'];
			} catch (e) {
			}
		}
		return await user.save();
	}

	async getOnlineClientInfo(id) {
		const currentData = await this.query.send('clientinfo', {clid: id});
		return currentData;
	}


	async isClientOnline({dbid, uid}) {
		const user = await this.getUserAndUpdateIfRequired({dbid, uid});
		try {
			const r = await this.query.send('clientgetids', {cluid: user['uid']});
			if (r.hasOwnProperty('clid')) {
				return r['clid'];
			}
		} catch (e) {
			return false;
		}
		return false;
	}

	async getUserAndUpdateIfRequired(param) {
		const user = await this.getUser(param);
		if (moment(user['lastUpdate']).isSameOrBefore(moment().subtract(this.cache, 'ms'))) {
			return await this.updateUser(param);
		} else {
			return user;
		}
	}

	async connectDB() {
		await this.mongoose.connect(this.mongodb);
		this.databaseConnected = true;
		this.gfs = this.Grid(this.db.db);
		return;
	}

	async getOnlineClients() {
		const currentClients = [];
		const rc = await this.query.send('clientlist');
		if (rc['id']) throw new Error(rc);
		if (!Array.isArray(rc['client_database_id'])) {
			if (rc['client_type'] === '0') {
				let user = JSON.parse(JSON.stringify(await this.updateUser({dbid: rc['client_database_id']})));
				user.channel = rc['cid'];
				user.clientID = rc['clid'];
				currentClients.push(user);
			}
		} else {
			for (const index in rc['client_database_id']) {
				if (!rc['client_database_id'].hasOwnProperty(index)) continue;
				if (rc['client_type'][index] === '0') {
					let user = JSON.parse(JSON.stringify(await this.updateUser({dbid: rc['client_database_id'][index]})));
					user.channel = rc['cid'][index];
					user.clientID = rc['clid'][index];
					currentClients.push(user);
				}
			}
		}
		return currentClients;
	}

	async getChannelTree(withClients = true) {
		if (!this.loggedIn) await this.login();
		const r = await this.query.send('channellist', '-icon', '-topic', '-flags', '-voice', '-limits');
		if (r['id']) throw new Error(r);
		const currentClients = withClients ? await this.getOnlineClients() : [];
		const channels = [];
		const remove = [];
		let prepareTree = {};
		let cleanSingelTree = {};
		let prepareClientsForTree = {};
		for (const index in r['channel_name'] || []) {
			if (!(r['channel_name'] || []).hasOwnProperty(index)) continue;
			const name = r['channel_name'][index];
			const id = r['cid'][index];
			const parent = r['pid'][index];
			const clientCount = r['total_clients'][index];
			let signedInt = parseInt(r['channel_icon_id'][index]);
			let unsignedInt;
			if (Math.sign(signedInt) === -1) {
				signedInt = signedInt * -1;
				unsignedInt = 4294967296 - signedInt;
			} else {
				unsignedInt = signedInt;
			}
			const iconID = unsignedInt;
			const cInfo = await this.getChannelAndUpdateIfRequired(id);
			const topic = cInfo['topic'];
			const password = cInfo['password'];
			const maxClients = cInfo['maxClients'];
			const maxClientCount = cInfo['maxClientCount'];
			const silence = cInfo['silence'];
			const secure = cInfo['secure'];
			const isDefault = cInfo['isDefault'];
			const isPrivate = cInfo['isPrivate'];
			const permanent = cInfo['permanent'];
			const channel = {
				name,
				id,
				parent,
				clientCount,
				iconID,
				topic,
				password,
				maxClientCount,
				maxClients,
				silence,
				secure,
				isDefault,
				isPrivate,
				permanent,
				tempChildren: [],
				children: []
			};
			if (withClients) channel.clients = [];
			channels.push(channel);
			if (channel.parent !== '0') remove.push(index);
			prepareTree[id] = channel;
			cleanSingelTree[id] = channel;
			prepareClientsForTree[id] = [];
		}
		prepareTree['0'] = {
			tempChildren: [],
			children: []
		};
		cleanSingelTree['0'] = {
			tempChildren: [],
			children: []
		};
		for (const channel of channels) {
			prepareTree[channel.parent].tempChildren.push(channel.id);
		}
		if (withClients) {
			for (let client of currentClients) {
				if (prepareClientsForTree.hasOwnProperty(client.channel)) {
					prepareClientsForTree[client.channel].push(client);
				}

			}
		}

		function resolveChildren(channel) {
			for (const child of channel.tempChildren) {
				const newChild = resolveChildren(cleanSingelTree[child]);
				channel.children.push(newChild);
			}
			delete channel.tempChildren;
			if (withClients && prepareClientsForTree.hasOwnProperty(channel.id)) {
				channel['clients'] = prepareClientsForTree[channel.id];
			}
			return channel;
		}

		channels.multisplice.apply(channels, remove);
		for (const index in channels) {
			if (!channels.hasOwnProperty(index)) continue;
			channels[index] = resolveChildren(channels[index]);
		}
		return JSON.parse(JSON.stringify(channels));
	}

	async getChannelInfo(id) {
		if (!this.loggedIn) await this.login();
		const channel = await this.Channel.findOne({id}).exec();
		if (channel) {
			return channel;
		} else {
			const r = await this.query.send('channelinfo', {cid: id});
			let signedInt = parseInt(r['channel_icon_id']);
			let unsignedInt;
			if (Math.sign(signedInt) === -1) {
				signedInt = signedInt * -1;
				unsignedInt = 4294967296 - signedInt;
			} else {
				unsignedInt = signedInt;
			}
			return await new this.Channel({
				id: id,
				name: r['channel_name'],
				topic: r['channel_topic'],
				description: r['channel_description'],
				password: r['channel_flag_password'] === '1',
				maxClientCount: parseInt(r['channel_maxclients']),
				maxClients: r['channel_flag_maxclients_unlimited'] === '1',
				silence: r['channel_forced_silence'] === '1',
				iconID: unsignedInt,
				codec: r['channel_codec'],
				codecQuality: r['channel_codec_quality'],
				permanent: r['channel_flag_permanent'] === '1',
				semiPermanent: r['channel_flag_semi_permanent'] === '1',
				isDefault: r['channel_flag_default'] === '1',
				path: r['channel_filepath'],
				needTalkPower: r['channel_needed_talk_power'] === '1',
				secure: r['channel_codec_is_unencrypted'] !== '1',
				isPrivate: r['channel_flag_private'] === '1',
				namePHONETIC: r['channel_name_phonetic'],
				parent: r['pid'],
				lastUpdate: new Date()
			}).save();
		}
	}

	async updateChannelInfo(id) {
		const channel = await this.getChannelInfo(id);
		const r = await this.query.send('channelinfo', {cid: id});
		channel['name'] = r['channel_name'];
		channel['topic'] = r['channel_topic'];
		channel['description'] = r['channel_description'];
		channel['password'] = r['channel_flag_password'] === '1';
		channel['maxClientCount'] = parseInt(r['channel_maxclients']);
		channel['maxClients'] = r['channel_flag_maxclients_unlimited'] === '1';
		channel['silence'] = r['channel_forced_silence'] === '1';
		let signedInt = parseInt(r['channel_icon_id']);
		let unsignedInt;
		if (Math.sign(signedInt) === -1) {
			signedInt = signedInt * -1;
			unsignedInt = 4294967296 - signedInt;
		} else {
			unsignedInt = signedInt;
		}
		channel['iconID'] = unsignedInt;
		channel['codec'] = r['channel_codec'];
		channel['codecQuality'] = r['channel_codec_quality'];
		channel['permanent'] = r['channel_flag_permanent'] === '1';
		channel['semiPermanent'] = r['channel_flag_semi_permanent'] === '1';
		channel['isDefault'] = r['channel_flag_default'] === '1';
		channel['path'] = r['channel_filepath'];
		channel['needTalkPower'] = r['channel_needed_talk_power'] === '1';
		channel['secure'] = r['channel_codec_is_unencrypted'] !== '1';
		channel['isPrivate'] = r['channel_flag_private'] === '1';
		channel['namePHONETIC'] = r['channel_name_phonetic'];
		channel['parent'] = r['pid'];
		channel['lastUpdate'] = new Date();
		return await channel.save();
	}

	async getChannelAndUpdateIfRequired(id) {
		const channel = await this.getChannelInfo(id);
		if (moment(channel['lastUpdate']).isSameOrBefore(moment().subtract(this.cache, 'ms'))) {
			return await this.updateChannelInfo(id);
		} else {
			return channel;
		}
	}

	async streamIcon({id, queue = true}) {
		if (queue) {
			return await this.streamFileTo({path: `/icon_${id}`, cid: 0});
		} else {
			return await this._streamFileTo({path: `/icon_${id}`, cid: 0});
		}
	}

	async streamAvatarFrom({dbid, uid, user, queue = true}) {
		if (!dbid && !uid && !user) throw new Error("You need to specify at least one: dbid, uid or user");
		let u = user;
		if (!u) {
			u = await this.getUserAndUpdateIfRequired({dbid, uid});
		}
		u = JSON.parse(JSON.stringify(u));
		if (!u.hasOwnProperty('avatarID')) throw new Error("User don't have an avatar.");
		const id = u['avatarID'];
		if (queue) {
			return await this.streamFileTo({path: `/avatar_${id}`, cid: 0});
		} else {
			return await this._streamFileTo({path: `/avatar_${id}`, cid: 0});
		}
	}

	async streamFileTo({path, cpw = "", dest, cid}) {
		return await this.queue.add(() => {
			return this._streamFileTo({path, cpw, dest, cid});
		});
	}

	async _streamFileTo({path, cpw = "", dest, cid = 0}) {
		const name = `/${cid}${path}`;
		const exists = await new Promise((resolve, reject) => {
			this.gfs.exist({filename: name}, (err, found) => {
				if (err) return reject(err);
				resolve(found);
			});
		});
		if (exists) {
			const meta = await new Promise((resolve, reject) => {
				this.gfs.files.find({filename: name}).toArray((err, files) => {
					if (err) return reject(err);
					resolve(files[0]);
				});
			});
			const lastUpdated = meta['metadata']['lastUpdate'];
			const datetime = new Date(parseInt(meta['metadata']['datetime']) * 1000);
			if (moment(lastUpdated).isSameOrBefore(moment().subtract(this.cache, 'ms'))) {
				const info = await this._getRemoteFileInfo({path: path});
				if (!moment(datetime).isSame(moment(new Date(parseInt(info['datetime']) * 1000)))) {
					await this._insertFile({datetime: info['datetime'], path: path, cid, cpw});
					const metaData = await new Promise((resolve, reject) => {
						this.gfs.files.find({filename: name}).toArray((err, files) => {
							if (err) return reject(err);
							resolve(files[0]);
						});
					});
					if (dest) {
						return {meta: metaData, stream: this.gfs.createReadStream({filename: name}).pipe(dest)};
					} else {
						return {meta: metaData, stream: this.gfs.createReadStream({filename: name})};
					}
				} else {
					await new Promise((resolve, reject) => {
						this.gfs.files.findOneAndUpdate({filename: name}, {
							$set: {
								'metadata.lastUpdate': new Date()
							}
						}, err => {
							if (err) return reject(err);
							resolve();
						});
					});
					const metaData = await new Promise((resolve, reject) => {
						this.gfs.files.find({filename: name}).toArray((err, files) => {
							if (err) return reject(err);
							resolve(files[0]);
						});
					});
					if (dest) {
						return {meta: metaData, stream: this.gfs.createReadStream({filename: name}).pipe(dest)};
					} else {
						return {meta: metaData, stream: this.gfs.createReadStream({filename: name})};
					}
				}
			} else {
				const metaData = await new Promise((resolve, reject) => {
					this.gfs.files.find({filename: name}).toArray((err, files) => {
						if (err) return reject(err);
						resolve(files[0]);
					});
				});
				if (dest) {
					return {meta: metaData, stream: this.gfs.createReadStream({filename: name}).pipe(dest)};
				} else {
					return {meta: metaData, stream: this.gfs.createReadStream({filename: name})};
				}
			}
		} else {
			const info = await this._getRemoteFileInfo({path: path});
			await this._insertFile({datetime: info['datetime'], path: path, cid, cpw});
			const metaData = await new Promise((resolve, reject) => {
				this.gfs.files.find({filename: name}).toArray((err, files) => {
					if (err) return reject(err);
					resolve(files[0]);
				});
			});
			if (dest) {
				return {meta: metaData, stream: this.gfs.createReadStream({filename: name}).pipe(dest)};
			} else {
				return {meta: metaData, stream: this.gfs.createReadStream({filename: name})};
			}
		}
	}

	async _insertFile({datetime, path, cpw = "", sDest, cid = 0}) {
		return await new Promise(async (resolve, reject) => {
			const r = await this.query.send('ftinitdownload', {
				clientftfid: Math.floor(Math.random() * 65535) + 1  ,
				name: path,
				cid: cid,
				seekpos: 0,
				cpw: cpw
			});
			if (r['id']) return reject(r);
			const client = new net.Socket();
			let error;
			let close = {client: false, grid: false, dest: sDest ? false : true, called: false};
			magic(client, (err, mime, output) => {
				if (err) reject(err);
				const GridWriteStream = this.gfs.createWriteStream({
					filename: `/${cid}${path}`,
					content_type: mime.type,
					metadata: {
						datetime: datetime,
						lastUpdate: new Date(),
						encoding: mime.encoding
					}
				});
				output.pipe(GridWriteStream);
				GridWriteStream.on('close', () => {
					close['grid'] = true;
					if (close['client'] && close['grid'] && close['dest'] && !close['called']) {
						close['called'] = true;
						if (error) {
							reject(error);
						} else {
							resolve();
						}
					}
				});
				GridWriteStream.on('error', e => {
					error = e;
				});
				if (sDest) {
					output.pipe(sDest);
					sDest.on('close', () => {
						close['dest'] = true;
						if (close['client'] && close['grid'] && close['dest'] && !close['called']) {
							close['called'] = true;
							if (error) {
								reject(error);
							} else {
								resolve();
							}
						}
					});
					sDest.on('error', e => {
						error = e;
					});
				}
			});
			client.on('close', () => {
				close['client'] = true;
				if (close['client'] && close['grid'] && close['dest'] && !close['called']) {
					close['called'] = true;
					if (error) {
						reject(error);
					} else {
						resolve();
					}
				}
			});
			client.on('error', (e) => {
				error = e;
			});
			client.on('connect', () => {
				client.write(r['ftkey'], 'utf8');
			});
			client.connect({
				port: r['port'],
				host: this.ip
			});
		})
	}

	async _getRemoteFileInfo({path, channel = 0, password = ""}) {
		const r = await this.query.send('ftgetfileinfo', {cid: channel, name: path, cpw: password})
		if (r['id']) throw new Error(r);
		return r;
	}

	async login() {
		if (this.loggedIn && this.databaseConnected) return true;
		if (!this.loggedIn) {
			const rLogin = await this.query.send('login', this.username, this.password);
			if (rLogin['id'] !== '0' || rLogin['msg'] !== 'ok') {
				throw new Error(rLogin);
			}
			const rServer = await this.query.send('use', this.server);
			if (rServer['id'] !== '0' || rServer['msg'] !== 'ok') {
				throw new Error(rServer);
			}
			const rNotify = await this.query.send('servernotifyregister', {'event': 'server'});
			if (rNotify['id'] !== '0' || rNotify['msg'] !== 'ok') {
				throw new Error(rNotify);
			}
			const rNotifyChannel = await this.query.send('servernotifyregister', {'event': 'channel', 'id': 0});
			if (rNotifyChannel['id'] !== '0' || rNotifyChannel['msg'] !== 'ok') {
				throw new Error(rNotify);
			}
		}
		setInterval(() => {
			this.query.send('cmd_custom_unknown_command').catch(e => {
				console.log("PLEASE DON'T LEAVE ME");
			});
		}, 2000);
		if (!this.databaseConnected) {
			await this.connectDB();
		}
		if (!this.loggedIn) {
			this.loggedIn = true;
			this._registerEvents();
		}
		return true;
	}

	_registerEvents() {
		if (this.loggedIn) {
			this.query.on('cliententerview', this._clientEventUpdate.bind(this));
			this.query.on('clientleftview', data => {
				console.log(data);
				this.emit('update');
			});
			this.query.on('clientmoved', this._clientEventUpdate.bind(this));
			this.query.on('channeledited', this._channelEventUpdate.bind(this));
			this.query.on('channelcreated', this._channelEventUpdate.bind(this));
			this.query.on('channelmoved', this._channelEventUpdate.bind(this));
			this.query.on('channelpasswordchanged', this._channelEventUpdate.bind(this));
			this.query.on('channeldescriptionchanged', this._channelEventUpdate.bind(this));
			this.query.on('channeldeleted', this._deleteChannel.bind(this));
		}
	}

	_deleteChannel(data) {
		if (data.hasOwnProperty('cid')) {
			this.queue.add(() => {
				return new Promise(resolve, reject => {
					this.Channel.findOneAndRemove({"id": data['cid']}, err => {
						if (err) {
							console.log(`Failed to delete channel with ID ${data['cid']}`);
							console.error(err);
							reject(err);
						} else {
							console.log(`Deleted channel with ID ${data['cid']}`);
							resolve();
						}
						this.emit('update');
					});
				});
			})
		}
	}

	async _clientEventUpdate(data) {
		console.log(data);
		if (data.hasOwnProperty('client_database_id') && data.hasOwnProperty('client_type') && data['client_type'] === '0') {
			try {
				await this.queue.add(() => {
					return this.updateUser({dbid: data['client_database_id']});
				});
				console.log(`Client with ID ${data['client_database_id']} updated!`);
				this.emit('update');
			} catch (e) {
				console.log(`Failed to update user Info with ID ${data['client_database_id']}`);
				console.error(e);
			}
		} else if (data.hasOwnProperty('clid')) {
			try {
				await this.queue.add(async () => {
					const r = await this.query.send('clientinfo', {clid: data['clid']});
					if (!r.hasOwnProperty('client_unique_identifier')) throw new Error(`Failed to execute query. ${JSON.stringify(r)}`);
					return await this.updateUser({uid: r['client_unique_identifier']});
				});
				console.log(`Client with active ID ${data['clid']} updated!`);
				this.emit('update');
			} catch (e) {
				console.log(`Failed to update user Info active with ID ${data['clid']}`);
				console.error(e);
			}
		}
	}

	async _channelEventUpdate(data) {
		if (data.hasOwnProperty('cid')) {
			try {
				await this.queue.add(() => {
					return this.updateChannelInfo(data['cid'])
				});
				console.log(`Channel with ID ${data['cid']} updated!`);
				this.emit('update');
			} catch (e) {
				console.log(`Failed to update Channel Info with ID ${data['cid']}`);
				console.error(e);
			}
		}
	}

	_registerDBEvent() {
		this.db.on('disconnected', () => {
			this.databaseConnected = false;
		});
		this.db.on('connected', () => {
			this.databaseConnected = true;
		});
		this.db.on('connecting', () => {
			this.databaseConnected = false;
		});
		this.db.on('disconnecting', () => {
			this.databaseConnected = false;
		});
		this.db.on('error', console.error.bind(console, 'connection error:'));
	}

	_generateDBModels() {
		this.User = this.mongoose.model('User', this.mongoose.Schema({
			uid: {
				type: String,
				index: true,
				unique: true
			},
			nickname: String,
			dbid: {
				type: String,
				index: true,
				unique: true
			},
			created: Date,
			lastconnected: Date,
			description: String,
			avatarID: String,
			connections: Number,
			upload: {
				total: Number,
				month: Number
			},
			download: {
				total: Number,
				month: Number
			},
			lastIP: String,
			online: {
				type: Boolean,
				default: false
			},
			country: String,
			iconID: String,
			away: Boolean,
			platform: String,
			version: String,
			muted: {
				input: {
					type: Boolean,
					default: false
				},
				output: {
					type: Boolean,
					default: false
				}
			},
			recording: {
				type: Boolean,
				default: false
			},
			channelCommander: {
				type: Boolean,
				default: false
			},
			hasAvatar: {
				type: Boolean,
				default: false
			}
		}));

		this.Channel = this.mongoose.model('Channel', this.mongoose.Schema({
			id: String,
			name: String,
			namePHONETIC: String,
			topic: String,
			description: String,
			password: Boolean,
			maxClientCount: Number,
			maxClients: Boolean,
			silence: Boolean,
			iconID: String,
			parent: String,
			codec: String,
			codecQuality: String,
			permanent: Boolean,
			semiPermanent: Boolean,
			isDefault: Boolean,
			path: String,
			needTalkPower: Boolean,
			isPrivate: Boolean,
			secure: Boolean,
			lastUpdate: Date
		}));
	}

	async getIcon(id) {

	}
}

Array.prototype.multisplice = function () {
	let args = Array.apply(null, arguments);
	args.sort(function (a, b) {
		return a - b;
	});
	for (let i = 0; i < args.length; i++) {
		const index = args[i] - i;
		this.splice(index, 1);
	}
};

module.exports = TSLib;