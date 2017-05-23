var active = false, self = this;

module.exports = {
	owner: 'MattBarton_',
	admins: [],
	active: this.active,
	deactivate: function deactivate () {
		self.active = false;
	},
	activate: function activate () {
		self.active = true;
	}
};