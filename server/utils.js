const moment = require('moment');

const generateNewMessage = (from, message, created_at) => {
	created_at = moment(created_at).format('h:mm');
	return {from, message, created_at};
};

const generateNewLocationShareMessage = (from, lat, lng, created_at) => {
	created_at = moment(created_at).format('h:mm');
	const message = `https://www.google.com/maps/?q=${lat},${lng}`;
	return {from, message, created_at};
};

const isValidString = function(string) {
	return typeof string === 'string' && string.trim().length > 0;
}

module.exports = {generateNewMessage, generateNewLocationShareMessage, isValidString};