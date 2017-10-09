var UTILS = load('shared.Utils');
var LOG = UTILS.log;

module.exports = function() {
	const job = new JobBuildAll();

	job.run()
	.then( (count) => {
		LOG('BuildAll/SUCCESS', count);
	})
	.catch( (error) => {
		LOG('BuildAll/FAIL', error.message);
	});
};

function JobBuildAll() {}

JobBuildAll.prototype.run = function() {
	try {
		return Promise.resolve()
		.then(this.getSiteMap.bind(this))
		.then(this.updateIndex.bind(this));
	} catch(e) {
		LOG('JobBuildAll.run', e.message);
		return Promise.reject({message: 'JobBuildAll.run:' + e.message});
	}
};

JobBuildAll.prototype.getSiteMap = function() {	
	try {
		const PageDO = load('shared.SolrPage').DO;
		let pageList = [];
		const siteConfig = loadConfig('site').config, siteMapUrl = siteConfig.domainName + siteConfig.siteMapUri;

		return load('shared.Curl').get(siteMapUrl, 10000)
		.then( (httpReturn) => {
			const xml = UTILS.parseXML(httpReturn.data);
			for (let index in xml.pages.page) {
				const url = siteConfig.domainName + xml.pages.page[index].url;
				const title = xml.pages.page[index].title;
				const tags = xml.pages.page[index].tags[0].tag.join();

				pageList.push(new PageDO(url, title, tags));
			}
			LOG('JobBuildAll.getSiteMap', 'pages=' + pageList.length);
			return pageList;		
		})
	} catch(e) {
		console.log(e);
		LOG('JobBuildAll.getSiteMap', e.message);
		return Promise.reject({message: 'JobBuildAll.getSiteMap(exception):' + e.message});
	}
};

JobBuildAll.prototype.updateIndex = function(pageDOList) {
	try {
		const PageDAO = load('shared.SolrPage').DAO;

		return PageDAO.bulkAdd(pageDOList)
		.then( (updateList) => {
			LOG('JobBuildAll.updateIndex', 'pages=' + updateList.length);
			return updateList.length;
		});
	} catch(e) {
		LOG('JobBuildAll.getSiteMap', e.message);
		return Promise.reject({message: 'JobBuildAll.updateIndex:' + e.message});
	}
};
