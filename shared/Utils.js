var Utils = {};

Utils.parseXML = function(content) {
	var xml = {};
	var XML2JS = require("xml2js");
	XML2JS.parseString(content, function(err, result) {
		xml = result;
	});
	return xml;
}

Utils.log = (module, message)=> {
	const currentTime = new Date();
	console.log('[' + currentTime.toLocaleString('en-US', {hour12:false}) + '] ' + module + ': ' + message);
};

module.exports.log = Utils.log;
module.exports.parseXML = Utils.parseXML;
