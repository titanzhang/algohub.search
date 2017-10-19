var UTILS = load('shared.Utils');
var LOG = UTILS.log;

module.exports = (request, response) => {
	( async () => {
		try {
			const controller = new UpdateController();
			await controller.run(request);
			response.send({status: true});
		} catch(e) {
			response.send({status: false, message: e.message});
		}
	})();
};

/**
 * Update/Add a page into the Solr index
 *
 * @class      UpdateController (name)
 */
class UpdateController {
	constructor() {}

	/**
	 * Entry method of UpdateController
	 *
	 * @param      {Express.Request}   request  The HTTP request object
	 * @return     {Promise}  None
	 */
	async run(request) {
		try {
			const pageDO = await this.parseParameters(request);
			await this.updateIndex(pageDO);
		} catch(e) {
			throw e;
		}
	}

	/**
	 * Parse and normalize the URL parameters
	 *
	 * @param      {Express.Request}   request  The HTTP request object
	 * @return     {Promise}  A PageDO Object
	 */
	async parseParameters(request) {
		try {
			const PageDO = load('shared.SolrPage').DO;
			return new PageDO(request.params.url, request.params.title, request.params.tags);
		} catch(e) {
			LOG('UpdateController.parseParameters', e.message);
			throw new Error('Parse parameters error');
		}
	}

	/**
	 * Update Solr index	
	 *
	 * @param      {PageDO}   pageDO  A PageDO object
	 * @return     {Promise}  The number of documents updated/added, should always be 1
	 */
	async updateIndex(pageDO) {
		try {
			const PageDAO = load('shared.SolrPage').DAO;
			const updateList = await PageDAO.bulkAdd([pageDO]);
			return updateList.length;
		} catch(e) {
			LOG('UpdateController.updateIndex', e.message);
			throw new Error('Update index error');
		}
	}

}