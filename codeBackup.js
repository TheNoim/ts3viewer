// async getClientInfoTest() {
// 	console.log(await this.query.send('clientdbinfo', {cldbid: 130}));
// }
//
// async testDownload() {
// 	if (!this.loggedIn) return false;
// 	console.log(await this.query.send('ftgetfilelist', {cid: 0, cpw: '', path: '/'}))
// 	const r = await this.query.send('ftinitdownload', {
// 		clientftfid: 6535,
// 		name: "/avatar_olaibegceppihaecdfhjcpndhimnecilfcfhpief",
// 		cid: 0,
// 		seekpos: 0,
// 		cpw: ""
// 	});
// 	const client = new net.Socket();
// 	console.log("IP: ", this.ip);
//
// 	client.pipe(fs.createWriteStream('./avatar.gif'));
// 	client.on('close', () => {
// 		console.log("Finished");
// 	});
// 	client.on('connect', () => {
// 		client.write(r['ftkey'], 'utf8');
// 	});
//
// 	client.connect({
// 		port: r['port'],
// 		host: this.ip
// 	});
// }



// async _sUAT(info, dest) {
// 	const name = `avatar_${info['avatarID']}`;
// 	const exists = await new Promise((resolve, reject) => {
// 		this.gfs.exist({filename: name}, (err, found) => {
// 			if (err) return reject(err);
// 			resolve(found);
// 		});
// 	});
// 	if (exists) {
// 		const meta = await new Promise((resolve, reject) => {
// 			this.gfs.files.find({filename: name}).toArray((err, files) => {
// 				if (err) return reject(err);
// 				resolve(files[0]);
// 			});
// 		});
// 		const lastUpdated = meta['metadata']['lastUpdate'];
// 		const datetime = new Date(parseInt(meta['metadata']['datetime']) * 1000);
// 		if (moment(lastUpdated).isSameOrBefore(moment().subtract(this.cache, 'ms'))) {
// 			const user = await this._getRemoteFileInfo({path: `/avatar_${user['avatarID']}`});
// 			if (!moment(datetime).isSame(moment(new Date(parseInt(info['datetime']) * 1000)))) {
// 				await this._insertAvatar(name, user['datetime'], user['avatarID']);
// 				const metaData = await new Promise((resolve, reject) => {
// 					this.gfs.files.find({filename: name}).toArray((err, files) => {
// 						if (err) return reject(err);
// 						resolve(files[0]);
// 					});
// 				});
// 				if (dest) {
// 					return {meta: metaData, stream: this.gfs.createReadStream({filename: name}).pipe(dest)};
// 				} else {
// 					return {meta: metaData, stream: this.gfs.createReadStream({filename: name})};
// 				}
// 			} else {
// 				await new Promise((resolve, reject) => {
// 					this.gfs.files.findOneAndUpdate({filename: name}, {
// 						$set: {
// 							'metadata.lastUpdate': new Date()
// 						}
// 					}, err => {
// 						if (err) return reject(err);
// 						resolve();
// 					});
// 				});
// 				const metaData = await new Promise((resolve, reject) => {
// 					this.gfs.files.find({filename: name}).toArray((err, files) => {
// 						if (err) return reject(err);
// 						resolve(files[0]);
// 					});
// 				});
// 				if (dest) {
// 					return {meta: metaData, stream: this.gfs.createReadStream({filename: name}).pipe(dest)};
// 				} else {
// 					return {meta: metaData, stream: this.gfs.createReadStream({filename: name})};
// 				}
// 			}
// 		} else {
// 			const metaData = await new Promise((resolve, reject) => {
// 				this.gfs.files.find({filename: name}).toArray((err, files) => {
// 					if (err) return reject(err);
// 					resolve(files[0]);
// 				});
// 			});
// 			if (dest) {
// 				return {meta: metaData, stream: this.gfs.createReadStream({filename: name}).pipe(dest)};
// 			} else {
// 				return {meta: metaData, stream: this.gfs.createReadStream({filename: name})};
// 			}
// 		}
// 	} else {
// 		const user = await this._getRemoteFileInfo({path: `/avatar_${user['avatarID']}`});
// 		await this._insertAvatar(name, user['datetime'], user['avatarID']);
// 		const metaData = await new Promise((resolve, reject) => {
// 			this.gfs.files.find({filename: name}).toArray((err, files) => {
// 				if (err) return reject(err);
// 				resolve(files[0]);
// 			});
// 		});
// 		if (dest) {
// 			return {meta: metaData, stream: this.gfs.createReadStream({filename: name}).pipe(dest)};
// 		} else {
// 			return {meta: metaData, stream: this.gfs.createReadStream({filename: name})};
// 		}
// 	}
// }
//
// async streamUserAvatarTo(info, dest) {
// 	return await this.queue.add(() => {
// 		return this._sUAT(info, dest);
// 	});
// }



// async _insertAvatar(name, datetime, avatarID, sDest) {
// 	return await new Promise(async (resolve, reject) => {
// 		const r = await this.query.send('ftinitdownload', {
// 			clientftfid: 1337,
// 			name: `/avatar_${avatarID}`,
// 			cid: 0,
// 			seekpos: 0,
// 			cpw: ""
// 		});
// 		if (r['id']) return reject(r);
// 		const client = new net.Socket();
// 		let error;
// 		let close = {client: false, grid: false, dest: sDest ? false : true, called: false};
// 		magic(client, (err, mime, output) => {
// 			if (err) reject(err);
// 			const GridWriteStream = this.gfs.createWriteStream({
// 				filename: name,
// 				content_type: mime.type,
// 				metadata: {
// 					datetime: datetime,
// 					lastUpdate: new Date(),
// 					encoding: mime.encoding
// 				}
// 			});
// 			output.pipe(GridWriteStream);
// 			GridWriteStream.on('close', () => {
// 				close['grid'] = true;
// 				if (close['client'] && close['grid'] && close['dest'] && !close['called']) {
// 					close['called'] = true;
// 					if (error) {
// 						reject(error);
// 					} else {
// 						resolve();
// 					}
// 				}
// 			});
// 			GridWriteStream.on('error', e => {
// 				error = e;
// 			});
// 			if (sDest) {
// 				output.pipe(sDest);
// 				sDest.on('close', () => {
// 					close['dest'] = true;
// 					if (close['client'] && close['grid'] && close['dest'] && !close['called']) {
// 						close['called'] = true;
// 						if (error) {
// 							reject(error);
// 						} else {
// 							resolve();
// 						}
// 					}
// 				});
// 				sDest.on('error', e => {
// 					error = e;
// 				});
// 			}
// 		});
// 		client.on('close', () => {
// 			close['client'] = true;
// 			if (close['client'] && close['grid'] && close['dest'] && !close['called']) {
// 				close['called'] = true;
// 				if (error) {
// 					reject(error);
// 				} else {
// 					resolve();
// 				}
// 			}
// 		});
// 		client.on('error', (e) => {
// 			error = e;
// 		});
// 		client.on('connect', () => {
// 			client.write(r['ftkey'], 'utf8');
// 		});
// 		client.connect({
// 			port: r['port'],
// 			host: this.ip
// 		});
// 	})
// }