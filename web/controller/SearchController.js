module.exports = function(request, response) {
	// Query format:
	// ?q=keyword&tag=tag&start=rowStart&rows=numRows

	const controller = new SearchController(request);
	controller.search()
	.then( (pages) => {
		response.send({
			status: true,
			result: {query: controller.query, pages: pages, pagination: controller.buildPagination()}
		});
	})
	.catch( (error) => {
		response.send({
			status: false,
			message: error.message,
			result: {query: controller.query, pages: [], pagination: controller.buildPagination()}});
	});
};

function SearchController(request) {
	this.baseUrl = loadConfig('site').config.searchpool + '/search';
	this.query = this.normalizeQuery(request);

	this.keyword = this.query.q;
	this.tag = this.query.tag;
	this.startIndex = Number(this.query.start);
	this.numRows = Number(this.query.rows);
}

SearchController.prototype.normalizeQuery = function(request) {
	let query = {};
	query.q = (request.query.q === undefined || request.query.q === "")? "*": request.query.q;
	query.tag = (request.query.tag === undefined || request.query.tag === "")? "*": request.query.tag;
	query.start = (request.query.start === undefined || request.query.start === "")? '0': request.query.start;
	query.rows = (request.query.rows === undefined || request.query.rows === "")? '20': request.query.rows;
	return query;
};

SearchController.prototype.buildPagination = function() {
	const constrains = '?q=' + this.query.q + '&tag=' + this.query.tag;
	const prevIndex = this.startIndex - this.numRows;
	const nextIndex = this.startIndex + this.numRows;
	const first = '&start=0';
	const prev = (prevIndex >= 0)? '&start=' + prevIndex: '';
	const next = (this.numRows == this.numRowsReturn)? '&start=' + nextIndex: '';

	let pagination = {first: this.baseUrl + constrains + first + '&rows=' + this.query.rows};
	if (prev !== '') {
		pagination.previous = this.baseUrl + constrains + prev + '&rows=' + this.query.rows;
	}
	if (next !== '') {
		pagination.next = this.baseUrl + constrains + next + '&rows=' + this.query.rows;
	}
	return pagination;
};

SearchController.prototype.search = function() {
	return load('shared.SolrPage').DAO.getListByKeywordTag(
		this.keyword,
		this.tag,
		this.startIndex,
		this.numRows)
	.then( (pages) => {
		this.numRowsReturn = pages.length;
		return pages;
	})
	.catch( (error) => {
		return Promise.reject({message: 'SearchController.search: ' + error.message});
	});
};