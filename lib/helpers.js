if (Meteor.isClient){



UI.registerHelper("connectionStatus", function(){
	return Meteor.status().connected;
	
})

UI.registerHelper("devMode", function(){
	if (Meteor.absoluteUrl().indexOf("local") > 0)
		return true;
	else
		return false;
})


UI.registerHelper('iPhone', function(){
	if (window.navigator.standalone)
		return true;
	else
		return false;
})

UI.registerHelper('isToday', function(date){
	var date = new Date(date);
	return moment(date).isSame(new Date(), 'day');
})

UI.registerHelper("unixTime", function(unix){
	var date = new Date(unix * 1000);
	return moment(date).format("DD MMM YYYY HH:MMa");
})
UI.registerHelper("date", function(dateType,date){
	var rawDate;
	if (date != undefined){
		 rawDate = new Date(date);
	}
	
	switch(dateType){
		case "fullDate":
		//console.log(date);
			return moment(rawDate).format("DD MMM YYYY HH:MMa");
		case "hoursMinutes":
			return moment(rawDate).format("DD MMM");
		case "time":
			return moment(rawDate).format("h:mma");
		case "timeFrom":
			return moment(rawDate).fromNow();
		case "timeTo":
		//console.log(date);
			return moment().to(rawDate);
		case "calendarTime":
			return moment(rawDate).calendar();
		case "dayDate":
			if (rawDate != undefined)
				if (moment(rawDate).isSame(new Date(), 'day'))
					return "Today";
				else
					return moment(rawDate).format("ddd, DD MMM");
			else
				return moment().format("ddd, DD MMM");
		default:
			return moment().format("DD MMM");
	}
	
})



UI.registerHelper('lineBreak', function(text){
  var paragraph = text.split("\n").join("<br>");
  return new Spacebars.SafeString(paragraph); 

})



  String.prototype.capitalize = function(lower) {
      return (lower ? this.toLowerCase() : this).replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
  };
	
}
