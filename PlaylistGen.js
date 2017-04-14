const app = {};

app.apiUrl = 'https://api.spotify.com/v1';

/* Allow user to enter names */
app.events = function() {
	$('form').on('submit', function(e) {
		
		e.preventDefault();
		let artists = $('input[type=search]').val();
		artists = artists.split(',');
		let search = artists.map(artistName => app.searchArtist(artistName));


		// This creates a 'chain-reaction' for grabbing the correct information
		app.retrieveArtistInfo(search);	

	});
};

/* Get artist from spotify */
app.searchArtist = (artistName) => $.ajax ({
	url: `${app.apiUrl}/search`,
	method: 'GET',
	dataType: 'json',
	data: {
		q: artistName,
		type: 'artist'
	}

});


/* Get artist album's with the IDs from spotify */
app.getArtistAlbums = (artistId) => $.ajax ({
	url: `${app.apiUrl}/artists/${artistId}/albums`,
	method: 'GET',
	dataType: 'json',
	data: {
		album_type: 'album'
	}
});

/* Get the tracks with the artist albums */
app.getArtistTracks = (id) => $.ajax ({
	url: `${app.apiUrl}/albums/${id}/tracks`,
	method: 'GET',
	dataType: 'json'

});


/* Grabs the Artist ID from the first search */
app.retrieveArtistInfo = function(search) {
	$.when(...search)
			.then((...results) => {
			
				results = results.map(getFirstElement)
								 .map(res => res.artists.items[0].id)
								 .map(id => app.getArtistAlbums(id));

				app.retrieveArtistTracks(results);

					/* fix the bug where you can't create list with one artist:

						console.log(results);
						for(let i = 0; i < results.length; i++) {
							console.log(results[i]);
						}
						let new_arr = results.map(res => {
							console.log(res);
							res[0]

						});

					*/
			});
}


/* Gets the correct ID's for a late  */
app.retrieveArtistTracks = function(artistAlbums) {
	$.when(...artistAlbums)
		.then((...albums) => {
			albumsID = albums.map(getFirstElement)
						   .map(res => res.items)
						   .reduce(flatten, [])
						   .map(album => album.id)
						   .map(ids => app.getArtistTracks(ids));

			app.buildPlaylist(albumsID);

			//console.log(albumsID);
		})
}

app.buildPlaylist = function(tracks) {
	$.when(...tracks)
		.then((...trackResults) => {

				trackResults = trackResults.map(getFirstElement)
										   .map(item => item.items)
										   .reduce(flatten, [])
										   .map(item =>item.id);

				const randomTracks = [];
				for(let i = 0; i < 30; i++) {
					randomTracks.push(getRandomTrack(trackResults));
				}

				//console.log(randomTracks.length);

				const baseURL = `https://embed.spotify.com/?theme=black&uri=spotify:trackset:My Playlist:${randomTracks}`;
				
				//console.log(baseURL);
				
				$('.playlist').html(`<iframe src="${baseURL}" height="380"></iframe>`);

		});
}

/* 
 * @getFirstElement: returns first element
 * @flatten: returns one array from multiple arrays
 * @getRandomTrack: returns a random track from the track array
 */
const getFirstElement = item => item[0];
const flatten = (prev, cur) => [...prev, ...cur];
const getRandomTrack = (trackArray) => {
	const randomNum = Math.floor(Math.random() * trackArray.length);
	return trackArray[randomNum];
}


app.init = function() {
	app.events();
};

$(app.init);