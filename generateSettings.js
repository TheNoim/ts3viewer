const fs = require('fs');
const packageJSON = require('./package');

require('dotenv').config();

const settings = {
	darkMode: process.env.TSVDARKMODE === 'true' || process.env.TSVDARKMODE === true,
	bbCode: process.env.TSVBBCODE === 'true' || process.env.TSVDARKMODE === true,
	version: packageJSON.version,
	title: process.env.TSVTITLE || "Teamspeak 3 Viewer",
	customFooterText: process.env.TSVFOOTERTEXT || ""
};

console.log(`Dark mode: ${process.env.TSVDARKMODE}`);
console.log(`BBCode: ${process.env.TSVBBCODE}`);
console.log(`Title: ${process.env.TSVTITLE}`);
console.log(`Footer Text: ${process.env.TSVFOOTERTEXT}`);
console.log(`Settings: ${JSON.stringify(settings)}`);

fs.writeFileSync('./src/settings.js', `module.exports = ${JSON.stringify(settings)};`);