Interests = new Meteor.Collection('interests');
Feed = new Meteor.Collection('feed');
Person = new Meteor.Collection('person');
Updates = new Meteor.Collection('updates');


if (Meteor.isClient){
	

	Router.plugin('dataNotFound', {notFoundTemplate: 'login'});
	Router.configure({
		notFoundTemplate: 'login',	
		layoutTemplate: 'layout',
		loadingTemplate: 'loading',		
	});


}




Router.route('/auth/', {
	name: 'auth',
	template: 'auth',
	onBeforeAction:function(){
		if (Meteor.isClient)
			Session.set("selectedFriend",undefined);
		this.next();
	},
	waitOn: function(){
		if (Meteor.isClient){
			// console.log("authorized user router");
			var token = this.params.hash;
			if (token == null){
				alert("Authorization Failed");
				Router.go('/');
			}
			else{
				Session.set("token", this.params.hash.substr(this.params.hash.indexOf("=") + 1));
				console.log("client - requesting profile info from server");
				var profile = Meteor.call('userProfile', this.params.hash.substr(this.params.hash.indexOf("=") + 1),function(error, result){
					if (error){
						console.log("client - error receiving profile information from server");
						Router.go('/');
					}
					else{
						console.log("client - received some profile data from server");
						Session.set("profile",result.data.data);
					}
				});
				
				console.log("client - attempting to ask server for friends list");
				var friends = Meteor.call('friends', this.params.hash.substr(this.params.hash.indexOf("=") + 1),function(error, result){
					if (error){
						console.log("client - error getting friends list from server");
						console.log(error);
						Router.go('/');
					}
					else{
						console.log("client - got friends list from server");
						Session.set("nextPageFriends", result.data.pagination.next_url);
						// console.log(result.data.data);
						Session.set("friends",result.data.data);
					}
				});				
			}
			this.next();
		}
	},
	// data: function(){
	// 	if (Meteor.isClient){
	// 		return Meteor.call('userProfile', this.params.hash.substr(this.params.hash.indexOf("=") + 1),function(error, result){
	// 			if (error){
	// 				console.log(error);
	// 			}
	// 			else{
	// 				console.log(result.data.data);
	// 				return result.data.data;
	// 			}
	// 		})			
	// 	}		
	// }
});
