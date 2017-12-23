const fs = require('fs');
const packageJSON = require('./package');

const settings = {
	darkMode: process.env.TSVDARKMODE === 'true' || true,
	bbCode: process.env.TSVBBCODE === 'true' || true,
	version: packageJSON.version
};

fs.writeFileSync('./src/settings.js', `module.exports = ${JSON.stringify(settings)};`);