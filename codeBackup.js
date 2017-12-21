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