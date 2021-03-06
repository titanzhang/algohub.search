
var PageDAO = {
	serverName: 'page'
};

// Data Access Object
PageDAO.bulkAdd = function(pages) {
	try {
		let server = load('shared.Solr').manager.getServer(this.serverName);

		return server.update(pages)
		.then( (solrReturn) => {
			return pages;
		})
		.catch( (error) => {
			return Promise.reject({ message: 'PageDAO.bulkAdd:' + error.message});
		});
	} catch(e) {
		return Promise.reject({ message: 'PageDAO.bulkAdd(exception):' + e.message });
	}
};

PageDAO.getListByKeywordTag = function(keyword, tag, start, numRows) {
	try {
		const searchTerm = 'title:' + encodeURIComponent(keyword);
		const filterTerm = ['tags:'+ encodeURIComponent(tag==='*'?tag: '"'+tag+'"')];
		const queryObj = {
			q: searchTerm,
			fq: filterTerm,
			start: start,
			rows: numRows
		};

		const server = load('shared.Solr').manager.getServer(this.serverName);
		return server.query(queryObj)
		.then( (solrReturn) => {
			let pageList = [];
			const docs = solrReturn.data.response.docs;
			for (let i in docs) {
				const doc = docs[i];
				pageList.push(new PageDO(doc.url, doc.title, doc.tags));
			}
			return pageList;
		})
		.catch( (error) => {
			return Promise.reject({message: 'PageDAO.getListByKeywordTag: ' + error.message});
		});
	} catch(e) {
		console.log(e);
		return Promise.reject({message: 'PageDAO.getListByKeywordTag(exception): ' + e.message});
	}
};

// Data Object
function PageDO(url, title, tags) {
	this.url = url || '';
	this.title = title || '';
	this.tags = tags || '';
};

PageDO.prototype.setUrl = function(url) {
	this.url = url;
	return this;
};

PageDO.prototype.setTitle = function(title) {
	this.title = title;
	return this;
};

PageDO.prototype.setTags = function(tags) {
	this.tags = tags;
	return this;
};


exports.DAO = PageDAO;
exports.DO = PageDO;