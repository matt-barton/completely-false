var active = false;

module.exports = {
	owner: 'MattBarton_',
	admins: [],
	active: active,
	deactivate: function deactivate () {
		active = false;
	},
	activate: function activate () {
		active = true;
	}
};