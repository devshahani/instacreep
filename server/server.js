	


if (Meteor.isServer){


Meteor.methods({
	userProfile: function(token){
		console.log("server - requesting profile info from Instagram");
		this.unblock();
		var query = HTTP.call("GET", "https://api.instagram.com/v1/users/self/?access_token="+ token);
		var user = query.data.data;
		user._id = user.id;
		var account = Interests.upsert({"_id": user._id}, user);
		Meteor.userId = user.id;
		Meteor.userToken = token;

		console.log("server - received profile data from Instagram - sending to client");
		return query;
	},
	friends: function(token){
		// console.log(token);
		this.unblock();
		console.log("server - requesting friends list from instagram");
		return HTTP.call("GET", "https://api.instagram.com/v1/users/self/follows?access_token=" + token);

	},
	moreFriends: function(url){
		// console.log(url);
		this.unblock();
		console.log("server - additional friends list requested from instagram");
		return HTTP.call("GET", url);
	},
	getFriendsRelations: function (nextUrl, resultSet){
	
		this.unblock();

		// if (resultSet){
		// 	console.log(resultSet.length);	
		// }
		
		
		if (nextUrl == null){
		// if (resultSet != undefined){	
			console.log("final return result");
			// console.log(nextUrl);
			console.log(resultSet.length);

			return resultSet;
		}


		else{
			// var asyncCall = Meteor.wrapAsync(HTTP.call());
			var query = HTTP.call("GET", nextUrl);
			var nextUrl = query.data.pagination.next_url;
			var data = query.data.data;



			if (resultSet == undefined)
				resultSet = [];


			resultSet = resultSet.concat(data);

			// console.log(resultSet.length);
			// console.log(nextUrl);
			if (nextUrl == undefined){
				nextUrl = null;
			}
			
			// console.log(nextUrl);
			// console.log(resultSet.length);

			return Meteor.call('getFriendsRelations', nextUrl, resultSet);
			
		}

	},
	friendsFeed: function(friendId, token){
		// var query = ;
		
		this.unblock();
		
		// console.log("looking for feed for " + friendId);
	    try{
	    	Meteor.userFriendId = friendId;

	    	var query = Meteor.call('getFriendsRelations',"https://api.instagram.com/v1/users/" + friendId + "/follows?access_token=" + token);

	    	if (query.length <= 0){
	    		return "0";
	    	}
	        _.each(query, function(item){
	        	// console.log(Meteor.userId);
	        	item._id = item.id;
	        	// delete item.id;
	        	Meteor.call('getFriendsMedia', item, Meteor.userFriendId);
	        	return;
	        	// return Person.upsert({"_id":item.id}, item);
	        })
	        // console.log(upsert);

	        return query.length;
	    }catch(error){
	        throw new Meteor.Error("Relations Fetcher", error.message);
	    
	    }		
		// return query;
	},	
	getFriendsMedia: function(friend){
		this.unblock();
		console.log("fetching friends follows media");
		// console.log(Meteor.userToken);
		var friend = friend;
		// var now = 
		var timeAgo = moment().subtract(2, 'hours');
		// console.log();
		var lastUpdate = Updates.findOne({"_id": friend._id,"when": {$gte: new Date(timeAgo.valueOf())}});
		// console.log(lastUpdate);
		if (lastUpdate != undefined){
			return;
		}
		var updateEvent = Updates.upsert({"_id":friend._id}, {$set :{"when": new Date()}});

		var nextUrl = "https://api.instagram.com/v1/users/" + friend._id + "/media/recent/?access_token=" + Meteor.userToken + "&min_timestamp=" + moment(moment().subtract(4, 'hours').valueOf()).unix()  + "&max_timestamp=" + moment(moment().valueOf()).unix();
		// console.log(nextUrl);
		HTTP.call("GET", nextUrl, function(error, result){
			if (result.data.data != undefined){
				_.each(result.data.data, function(item){
					item.owner = Meteor.userFriendId;
					item.when = new Date();
					// console.log(item);
					// var limitCount = Feed.find({"owner":Meteor.userFriendId}).count();
					// if (limitCount > 30){
					// 	return;
					// }
					// else{
						var date = new Date(item.created_time * 1000)
						if (moment(date).isSame(new Date(), 'week')){
							
							return Feed.upsert({"id":item.id, "owner": Meteor.userFriendId}, item);	
						}
						else{
							return;
						}
					// }
					
				});
				return;
			}			
		});
		return;
	}
})

Meteor.publish("feed", function (id) {
  // console.log(id);
  // var momentsAgo = moment().subtract(6, 'hours').valueOf();
  // var date = new Date(momentsAgo);
  // return Feed.find({"owner": id},{sort:{"created_time":-1}});

	var timeAgo = moment().subtract(12, 'hours');
	return Feed.find({"owner": id,"when": {$gte: new Date(timeAgo.valueOf())}});

});





}