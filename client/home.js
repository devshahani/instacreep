Template.auth.events({
	'click #user': function () {
		console.log("getting profile");

	}
});

Template.auth.helpers({
	user: function () {
		return Session.get("profile");
	}
});

Template.loggedIn.rendered = function () {
	// $('#home').velocity("transition.fadeIn");
};


Template.loggedIn.events({
	'click #loadMore': function () {
		console.log("loading more friends");
		$('#loadMore').velocity("transition.bounceOut");
		var friends = Meteor.call('moreFriends', Session.get("nextPageFriends"), function(error, result){
			if (error){
				console.log(error);
				$('#loadMore').velocity("transition.bounceIn");
			}
			else{
				Session.set("nextPageFriends", result.data.pagination.next_url);
				Session.set("friends", Session.get("friends").concat(result.data.data));
				$('#loadMore').velocity("transition.bounceIn");
				// console.log(result);
			}
		})
	},
	'click .friend': function(){

		Session.set("selectedFriend", this);

		// Session.set("friendsRelations", Session.get("friendsRelations").concat(query));
		// $('#friendPopUp').velocity("transition.bounceIn");
	}
});	
Template.loggedIn.helpers({
	'showFriendFeed': function(){
		if (Session.equals("selectedFriend",undefined)){
			return false;
		}
		else{
			return true;
		}
		// return Session.get("selectedFriend");
	},
	friends: function () {
		return Session.get("friends");
	},
	canLoadMore:function(){
		if (Session.get("nextPageFriends") == undefined){
			return false;
		}
		else{
			return true;
		}
	}
});

Template.friendFeed.created = function () {
	
	
	this.subscribe("feed", Session.get("selectedFriend").id,{"onReady": function(){
		if (Feed.find().count() > 0){
			Session.set("friendsRelations", true);
		}
	}});	

	Meteor.call('friendsFeed', Session.get("selectedFriend").id, Session.get("token"), function(error, result){
		// console.log(result);
		if (error){
			console.log(error.message);
		}
		else{
			Session.set("friendsRelations", result);


			if (result != "0"){
				return;
			}
			else{
				document.getElementById("noData").innerHTML = "Sorry!<br>Can't find any publicly available data";
			}
			

		}
	});		
};
Template.friendFeed.rendered = function () {
	$('#home').velocity("transition.fadeOut");

};
Template.friendFeed.destroyed = function () {
	// $('.scrollable').removeClass('noscroll');	
	// $('.scrollable').addClass('scrollable');
	
};



Template.friendFeed.events({
	'click .close': function () {
		// alert("attempting to close");
		Session.set("selectedFriend",undefined);
		$('#home').velocity("transition.fadeIn");
		// $('#friendPreview').velocity('transition.bounceUpIn');
	}
});



Template.friendFeed.helpers({
	'token': function(){
		return Session.get("token");
	},
	friend: function () {
		return Session.get("selectedFriend");
	},
	relations: function(){
		return Session.get("friendsRelations");
	}
});

Template.finalFeed.rendered = function () {
	$('#friendHeader').velocity("transition.bounceDownIn");
};





Template.finalFeed.onCreated(function () {
	this.autorun(function(){
		if (Feed.find({}).count() > 0){
			$('#friendPreview').velocity('transition.bounceOut');
		}
		
	});

	this.pageNumber = new ReactiveVar(1);
	// this.subscribe("feed", Session.get("selectedFriend").id,{"onReady": function(){

	// }});
});

Template.finalFeed.helpers({
	feed: function () {
		var limit = Template.instance().pageNumber.get();

		return Feed.find({},{sort:{"created_time":-1}, limit: limit *14});
	}
});


Template.finalFeed.events({
	'click .loadMore': function () {
		Template.instance().pageNumber.set(Template.instance().pageNumber.get() + 1);

	}
});


Template.selectFriendHeader.rendered = function () {
	$(document).ready(function(){
		$('#selectFriendHeader').velocity("transition.bounceDownIn", 500, true);	
	})
	
};
// Template.selectFriendHeader.destroyed = function () {
// 	$('#selectFriendHeader').velocity("transition.bounceUpOut");
// };






