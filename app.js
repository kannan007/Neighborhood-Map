var favouritelocations=
[
	{
	    name: 'DLF IT Park',
	    latlng: {
	        lat: 13.023487,
	        lng: 80.176716
	    },
	    address: 'DLF IT Park Porur Chennai',
	    id: 'DLF'
	},
	{
	    name: 'Central Railway Station',
	    latlng: {
	        lat: 13.082335,
	        lng: 80.275447
	    },
	    address: 'Central Railway Station Chennai Tamilnadu',
	    id: 'Railway Station'
	},
	{
	    name: 'Olympia Tech Park',
	    latlng: {
	        lat: 13.014186,
	        lng: 80.203677
	    },
	    address: 'Olympia Tech Park Guindy Chennai',
	    id: 'Tech Park'
	},
	{
	    name: 'IIT Madras',
	    latlng: {
	        lat: 12.990842,
	        lng: 80.233884
	    },
	    address: 'IIT Guindy Chennai',
	    id: 'IIT'
	},
	{
	    name: 'Amazon Chennai',
	    latlng: {
	        lat: 12.969915,
	        lng: 80.243763
	    },
	    address: 'SP Infocity Perungudi Chennai',
	    id: 'SP Infocity'
	}
];
var seperatelocation=function(data)
{
	this.name=ko.observable(data.name);
	this.position=ko.observable(data.latlng);
	this.address=ko.observable(data.address);
	this.id=ko.observable(data.id);
};
var ViewModel=function()
{
	var self=this;
	this.query=ko.observable('');
	this.locationlist=ko.observableArray();
	favouritelocations.forEach(function(locations)
	{
		self.locationlist.push(new seperatelocation(locations));
	});
	//console.log(this.locationlist());
	this.currentlocation=ko.observable(this.locationlist());
	this.changelocation=function(clickedlocation)
	{
		self.currentlocation(clickedlocation);
		//hideListings();
		showListings();
	};
	this.search=function(value)
	{
		//console.log(value);
		self.locationlist.removeAll();
		for(var x in favouritelocations)
		{
			if(favouritelocations[x].name.toLowerCase().indexOf(value.toLowerCase())>=0)
			{
				self.locationlist.push(new seperatelocation(favouritelocations[x]));
			}
		}
		//console.log(self.locationlist());
	};
	this.query.subscribe(this.search);
};
var ViewModel= new ViewModel();
ko.applyBindings(ViewModel);
var map,geocoder;
var locationmap=ViewModel.locationlist();
var markers=[];
function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    console.log(locationmap);
    geocoder = new google.maps.Geocoder();
    map = new google.maps.Map(document.getElementById('map'),
    {
        center: {lat: 13.023487, lng: 80.176716},
        zoom: 5
    });
    var largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();
	for (var i = 0; i<locationmap.length; i++)
	{
        // Get the position from the location array.
        var position = locationmap[i].position();
        var title = locationmap[i].name();
        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
        	map: map,
        	position: position,
        	title: title,
        	animation: google.maps.Animation.BOUNCE,
            id: i
        });
          // Push the marker to our array of markers.
        markers.push(marker);
        //console.log(markers[0]);
        // Create an onclick event to open an infowindow at each marker.
        marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
        });
          bounds.extend(markers[i].position);
    }
        // Extend the boundaries of the map for each marker
        map.fitBounds(bounds);
};
// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
	// Check to make sure the infowindow is not already opened on this marker.
	if(infowindow.marker != marker)
	{
		infowindow.marker = marker;
		infowindow.setContent('<div>' + marker.title + '</div>');
		infowindow.open(map, marker);
		// Make sure the marker property is cleared if the infowindow is closed.
		infowindow.addListener('closeclick',function(){
		infowindow.setMarker = null;
		});
	}
};
function showListings()
{
	var currentlocation=ViewModel.currentlocation();
	console.log(currentlocation.name());
	var locationname=currentlocation.name();
	var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < markers.length; i++)
    {
    	if(locationname==markers[i].title)
    	{
    		console.log(markers[i].title);
    		markers[i].setMap(map);
      		bounds.extend(markers[i].position);
    	}
    }
    map.setZoom(10);
    map.fitBounds(bounds);
}
function hideListings() {
	console.log("do something");
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}