const fs = require('fs');
const packageJSON = require('./package');

const settings = {
	darkMode: process.env.TSVDARKMODE === 'true' || process.env.TSVDARKMODE === true,
	bbCode: process.env.TSVBBCODE === 'true' || process.env.TSVDARKMODE === true,
	version: packageJSON.version
};

console.log(`Dark mode: ${process.env.TSVDARKMODE}`);
console.log(`BBCode: ${process.env.TSVBBCODE}`);
console.log(`Settings: ${JSON.stringify(settings)}`);

fs.writeFileSync('./src/settings.js', `module.exports = ${JSON.stringify(settings)};`);