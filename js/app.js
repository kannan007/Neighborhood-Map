//Initialized my favourite locations in an array object
function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    geocoder = new google.maps.Geocoder();
    map = new google.maps.Map(document.getElementById('map'),
    {
        center: {lat: 13.023487, lng: 80.176716},
        zoom: 15
    });
    setTimeout(function ()
    {
		viewModel.rendermap();
	}, 1200);
};
var clientID='01JLACFGMSPJVDDDBCXZMKGJFCFAWZFQYBFJGPTXKZ0BJ00M';
var clientSECRET='KMZIVAGXX1D04CYEH0GJRSIZXM5I32E5IATL0XKIP0GEPNYQ';
var map,geocoder;
var markers=[];
var favouritelocations=
[
	{
	    name: 'DLF IT Park Chennai',
	    latlng: {
	        lat: 13.023487,
	        lng: 80.176716
	    },
	    address: 'DLF IT Park Porur Chennai',
	    id: 'DLF',
	    className: '',
	    content: ''
	},
	{
	    name: 'Central Railway Station Chennai',
	    latlng: {
	        lat: 13.082335,
	        lng: 80.275447
	    },
	    address: 'Central Railway Station Chennai Tamilnadu',
	    id: 'Railway Station',
	    className: '',
	    content: ''
	},
	{
	    name: 'Olympia Tech Park Chennai',
	    latlng: {
	        lat: 13.014186,
	        lng: 80.203677
	    },
	    address: 'Olympia Tech Park Guindy Chennai',
	    id: 'Tech Park',
	    className: '',
	    content: ''
	},
	{
	    name: 'IIT Madras Chennai',
	    latlng: {
	        lat: 12.990842,
	        lng: 80.233884
	    },
	    address: 'IIT Guindy Chennai',
	    id: 'IIT',
	    className: '',
	    content: ''
	},
	{
	    name: 'Amazon Chennai',
	    latlng: {
	        lat: 12.969915,
	        lng: 80.243763
	    },
	    address: 'SP Infocity Perungudi Chennai',
	    id: 'SP Infocity',
	    className: '',
	    content: ''
	}
];
//An object constructor to create elements
var seperatelocation=function(data)
{
	this.name=ko.observable(data.name);
	this.position=ko.observable(data.latlng);
	this.address=ko.observable(data.address);
	this.id=ko.observable(data.id);
	this.className=ko.observable(data.className);
	this.content=ko.observable(data.content);
};
//View Model
var ViewModel=function()
{
	var self=this;
	this.query=ko.observable('');
	this.className=ko.observable('active')
	this.locationlist=ko.observableArray();
	//To push favourite locations into locationlist array
	favouritelocations.forEach(function(locations)
	{
		self.locationlist.push(new seperatelocation(locations));
	});
	this.locationlist().forEach(function(item,index)
	{
		var api_error = setTimeout(function()
        {
			alert("Oops! Foursquare API failed to load");
		},4000);
		$.ajax(
		{
			type: 'GET',
			dataType: "jsonp",
			cache: false,
			url: 'https://api.foursquare.com/v2/venues/search',
			data: 'client_id='+clientID+'&client_secret='+clientSECRET+'&v=20160814&ll='+item.position().lat+','+item.position().lng+'&query='+item.name(),
			success: function(data)
			{
				clearTimeout(api_error);
				//Setting the info window data as the distance and check in count using the Foursquare API.
				//item.marker.title =  data.response.venues[0].name ;
				content = '	Distance: '+ (data.response.venues[0].location.distance)/1000 + " km's CheckinCount: ' " + data.response.venues[0].stats.checkinsCount;
				favouritelocations[index].content=content;
				item.content=ko.observable(content);
			}
		});
	});
	this.currentlocation=ko.observable(this.locationlist());
	//changelocation function is defined when user clicks on any list items it will call showListings function with paramater(which is clicked item)
	this.changelocation=function(clickedlocation)
	{
		if (!self.currentlocation().length) { // The first time the property is an Array, and we do not need to remove the active class
  			self.currentlocation().className('');
		}
		clickedlocation.className('active');
		self.currentlocation(clickedlocation);
		self.showListings(clickedlocation);
	};
	//Filter function to filter out the list if the user types a text in input box
	this.search=function(value)
	{
		self.locationlist.removeAll();
		for(var x in favouritelocations)
		{
			if(favouritelocations[x].name.toLowerCase().indexOf(value.toLowerCase())>=0)
			{
				self.locationlist.push(new seperatelocation(favouritelocations[x]));
				self.fitermap();
			}
		}
	};
	this.query.subscribe(this.search);
	this.rendermap=function()
	{
		this.hideListings();
		var locationmap=self.locationlist();
		var largeInfowindow = new google.maps.InfoWindow();
	    var bounds = new google.maps.LatLngBounds();
		for (var i = 0; i<locationmap.length; i++)
		{
	        // Get the position from the location array.
	        var position = locationmap[i].position();
	        var title = locationmap[i].name();
			var content=locationmap[i].content();
			if(!(content.length>=0))
			{
				content+="Foursquare failed to fetch results";
			}
	        var marker = new google.maps.Marker({
	        	map: map,
	        	position: position,
	        	title: title,
	        	content: content,
	        	animation: google.maps.Animation.BOUNCE,
	        	visible : true,
	            id: i
	        });

	        // Push the marker to our array of markers.
	        markers.push(marker);
	        map.setCenter(marker.getPosition());
	        // Create an onclick event to open an infowindow at each marker.
	        marker.addListener('click', function() {
	        	self.toggleBounce(this);
	            self.populateInfoWindow(this, largeInfowindow);
	        });
	        bounds.extend(marker.position);
	    }
	    setTimeout(function ()
	    {
			self.stopbouncing();
		}, 700);
	    // Extend the boundaries of the map for each marker
	    map.fitBounds(bounds);
	    map.setZoom(12);
	};
	//this function is to bounce the marker if user is clicked one particular location on map
	this.toggleBounce=function(marker) {
		if (marker.getAnimation() !== null)
		{
	      	marker.setAnimation(null);
	    }
	    else
	    {
	        marker.setAnimation(google.maps.Animation.BOUNCE);
	    }
	    setTimeout(function ()
	    {
			marker.setAnimation(null);
		}, 1000);
	};
	// This function populates the infowindow when the marker is clicked. We'll only allow
	// one infowindow which will open at the marker that is clicked, and populate based
	// on that markers position.
	this.populateInfoWindow=function(marker, infowindow) {
		// Check to make sure the infowindow is not already opened on this marker.
		if(marker.infoWindow)
		{
      		marker.infoWindow.open(map, marker);
    	}
		// Check to make sure the infowindow is not already opened on this marker.
		else
		{
			infowindow.marker = marker;
			infowindow.setContent('<div>' + '<h2>' + marker.title + '</h2>' + marker.content + '</div>');
			infowindow.open(map, marker);
			// Make sure the marker property is cleared if the infowindow is closed.
			infowindow.addListener('closeclick',function(){
				infowindow.marker = null;
			});
			// saving infowWindow instance into the marker
			marker.infoWindow = infowindow;
		}
	};
	//We have called this function changelocation which is in ViewModel it will display the location which is clicked
	this.showListings=function(value)
	{
		var locationname=value.name();
		var bounds = new google.maps.LatLngBounds();
		var largeInfowindow = new google.maps.InfoWindow();
	    // Extend the boundaries of the map for each marker and display the marker
	    for (var i = 0; i < markers.length; i++)
	    {
	    	if(locationname==markers[i].title)
	    	{
	    		markers[i].setVisible(true);
	    		map.setCenter(markers[i].getPosition());
	    		self.populateInfoWindow(markers[i],largeInfowindow);
	    		self.toggleBounce(markers[i]);
	    	}
	    	else
	    	{
	    		markers[i].setVisible(false);
	    		if(markers[i].infoWindow)
    			{
    				markers[i].infoWindow.close();
    			}
	    	}
	    }
	    map.setZoom(14);
	};
	this.fitermap=function()
	{
		var locationmap=self.locationlist();
		var largeInfowindow = new google.maps.InfoWindow();
		var locationfilters=[];
		var markerfilters=[];
		locationmap.forEach(function(location)
		{
			locationfilters.push(location.name());
		});
		for(var i=0;i<markers.length;i++)
		{
			for(var j=0;j<locationfilters.length;j++)
			{
				if(markers[i].title==locationfilters[j])
				{
					markerfilters.push(i);
				}
				else
				{
					markers[i].setVisible(false);
					if(markers[i].infoWindow)
	    			{
	    				markers[i].infoWindow.close();
	    			}
				}
			}
		}
		for(var i=0;i<markerfilters.length;i++)
		{
			markers[markerfilters[i]].setVisible(true);
		}
		map.setZoom(12);
	};
	//to stop the animation bouncing after a few seconds called by timeout function
	this.stopbouncing=function() {
	    for (var i = 0; i < markers.length; i++) {
	        markers[i].setAnimation(null);
	    }
	};
	this.hideListings=function()
	{
		for (var i = 0; i < markers.length; i++) {
	        markers[i].setVisible(false);
	    }
	}
};
var viewModel= new ViewModel();
ko.applyBindings(viewModel);
