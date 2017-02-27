//Initialized my favourite locations in an array object
var clientID='01JLACFGMSPJVDDDBCXZMKGJFCFAWZFQYBFJGPTXKZ0BJ00M';
var clientSECRET='KMZIVAGXX1D04CYEH0GJRSIZXM5I32E5IATL0XKIP0GEPNYQ';
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
			data: 'client_id='+clientID+'&client_secret='+clientSECRET+'&v=20130815&ll='+item.position().lat+','+item.position().lng+'&query='+item.name(),
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
		clickedlocation.className('active');
		self.currentlocation(clickedlocation);
		showListings(clickedlocation);
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
				rendermap();
			}
		}
	};
	this.query.subscribe(this.search);
};
var ViewModel= new ViewModel();
ko.applyBindings(ViewModel);
var map,geocoder;
var markers=[];
function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    geocoder = new google.maps.Geocoder();
    map = new google.maps.Map(document.getElementById('map'),
    {
        center: {lat: 13.023487, lng: 80.176716},
        zoom: 5
    });
    setTimeout(function ()
    {
		rendermap();
	}, 1100);
};
function rendermap()
{
	hideListings();
	var locationmap=ViewModel.locationlist();
	var largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();
	for (var i = 0; i<locationmap.length; i++)
	{
        // Get the position from the location array.
        var position = locationmap[i].position();
        var title = locationmap[i].name();
		var content=locationmap[i].content();
		console.log(content);
		if(!(content.length>=0))
		{
			content="Foursquare failed to fetch results";
		}
        var marker = new google.maps.Marker({
        	map: map,
        	position: position,
        	title: title,
        	content: content,
        	animation: google.maps.Animation.BOUNCE,
            id: i
        });

        // Push the marker to our array of markers.
        markers.push(marker);
        //map.panTo(markers[i].getPosition());
        map.setCenter(markers[i].getPosition());
        // Create an onclick event to open an infowindow at each marker.
        marker.addListener('click', function() {
        	toggleBounce(this);
            populateInfoWindow(this, largeInfowindow);
        });
        bounds.extend(markers[i].position);
    }
    setTimeout(function ()
    {
		stopbouncing();
	}, 1300);
	//map.setZoom(5);
    // Extend the boundaries of the map for each marker
    map.fitBounds(bounds);
};
setTimeout(function() {
  if(!window.google || !window.google.maps) {
    //handle script not loaded
    alert("Some error Google Maps not Loaded");
  }
}, 3000);
//this function is to bounce the marker if user is clicked one particular location on map
function toggleBounce(marker) {
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
function populateInfoWindow(marker, infowindow) {
	// Check to make sure the infowindow is not already opened on this marker.
	if(infowindow.marker != marker)
	{
		infowindow.marker = marker;
		infowindow.setContent('<div>' + '<h2>' + marker.title + '</h2>' + marker.content + '</div>');
		infowindow.open(map, marker);
		// Make sure the marker property is cleared if the infowindow is closed.
		infowindow.addListener('closeclick',function(){
		infowindow.setMarker = null;
		});
	}
};
//We have called this function changelocation which is in ViewModel it will display the location which is clicked
function showListings(value)
{
	var locationname=value.name();
	var bounds = new google.maps.LatLngBounds();
	var largeInfowindow = new google.maps.InfoWindow();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < markers.length; i++)
    {
    	if(locationname==markers[i].title)
    	{
    		markers[i].setMap(map);
    		//value.className('active');
    		map.setCenter(markers[i].getPosition());
    		populateInfoWindow(markers[i],largeInfowindow);
    		toggleBounce(markers[i]);
    	}
    	else
    	{
    		markers[i].setMap(null);
    	}
    }
    map.setZoom(14);
};
//to stop the animation bouncing after a few seconds called by timeout function
function stopbouncing() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setAnimation(null);
    }
};
function hideListings()
{
	for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}