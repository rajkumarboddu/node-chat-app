class Users {

	constructor() {
		this.users = [];
	}

	addUser(id, name, room_name) {
		const newUser = {id, name, room_name};
		this.users.push(newUser);
		return newUser;
	}

	getUserNames(room_name) {
		return this.users.filter((user) => user.room_name===room_name).map((user) => user.name);
	}

	getUser(user_id) {
		return this.users.filter((user) => user.id===user_id)[0];
	}

	removeUser(user_id) {
		let removed_user = this.getUser(user_id);
		this.users = this.users.filter((user) => user.id!==user_id);
		return removed_user;
	}

	getRoomNames() {
		return this.users.map((user) => user.room_name).filter((value, index, self) => self.indexOf(value) === index);
	}

	isUsernameExists(user_name) {
		return this.users.filter((user) => user.name===user_name).length > 0;
	}
}

module.exports = {Users};