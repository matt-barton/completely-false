var active = false;

module.exports = {
	owner: 'MattBarton_',
	admins: [],
	active: function () {
		return active;
	},
	deactivate: function deactivate () {
		active = false;
	},
	activate: function activate () {
		active = true;
	}
};