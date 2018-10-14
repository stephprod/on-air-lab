module.exports = function (request, response, next){ // NEXT EFFECTUE L'OPERATION SUIVANTE

	if (request.session.flash) {
		response.locals.flash = request.session.flash
		request.session.flash = undefined
	}

	request.flash = function (type, content){
		if (request.session.flash === undefined) {
			request.session.flash = {}
		}
		request.session.flash[type] = content
	}
	next()
}