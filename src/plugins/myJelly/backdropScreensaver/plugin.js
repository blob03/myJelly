/* eslint-disable indent */
import ServerConnections from '../../../components/ServerConnections';
import * as userSettings from '../../../scripts/settings/userSettings';

class BackdropScreensaver {
    constructor() {
        this.name = 'My Backdrop Player';
		this.version = '1.71';
		this.group = 'myJelly';
		this.description = 'MJBackdropScreensaverHelp';
        this.type = 'screensaver';
        this.id = 'mJbackdropscreensaver';
        this.supportsAnonymous = false;
		this.hideOnClick = true;
		this.hideOnMouse = true;
		this.hideOnKey = true;
    }
	
	blackout_ON() {
		const elem = document.querySelector('.blackout');
		if (!elem) {
			import('./style.scss').then(() => {
				let elem = document.createElement('div');
				elem.classList.add('blackout');
				document.body.appendChild(elem);
			});
		}
	}
	
	blackout_OFF() {
		const elem = document.querySelector('.blackout');
		if (elem) {
			return new Promise((resolve) => {
				if (elem.parentNode)
					elem.parentNode.removeChild(elem);
				resolve();
			});
		}
	}
	
	show(TEST) {
		let type = null;
		let autoplayDelay = null;
		let swiperFX = null;
		// When tested, use the relevant parameters as they are set in the settings page
		// at the time of the call rather than the ones saved.
		if (TEST === true) {
			this.hideOnMouse = false;
			// Get the source of backdrops currently selected.
			let srcBackdrops = document.querySelector('#srcBackdrops');
			if (srcBackdrops)
				type = srcBackdrops.value;
			// Also get the slideshow delay and animation selected.
			autoplayDelay = document.querySelector('#sliderSwiperDelay').value;
			swiperFX = document.querySelector('#selectSwiperFX').value;
		} else 
			this.hideOnMouse = true;
		
		if (type === null)
			type = userSettings.enableBackdrops();
		
		let types = '';
		let filters = '';

		switch(type) {
			case "LibrariesFav":
			case "MovieFav":
			case "SeriesFav":
			case "ArtistsFav":
				filters = 'IsFavorite';
				break;
		}

		switch(type) {
			case "Libraries":
			case "LibrariesFav":
				types = 'Movie,Series,MusicArtist';
				break;
				
			case "Movie":
			case "MovieFav":
				types = "Movie";
				break;

			case "Series":
			case "SeriesFav":
				types = "Series";
				break;
				
			default:
				types = "";
		}
		
		let query;
		let apiClient;
		
		switch(type) {
			case "Libraries":
			case "LibrariesFav":
			case "Movie":
			case "MovieFav":
			case "Series":
			case "SeriesFav":
				query = {
					ImageTypes: 'Backdrop',
					EnableImageTypes: 'Backdrop',
					IncludeItemTypes: types,
					SortBy: 'Random',
					Recursive: true,
					Fields: 'Taglines',
					ImageTypeLimit: 1,
					StartIndex: 0,
					Filters: filters,
					Limit: 200
				};
				apiClient = ServerConnections.currentApiClient();
				apiClient.getItems(apiClient.getCurrentUserId(), query).then( (result) => {
					if (result.Items.length) {
						import('../../../components/slideshow/slideshow').then(({default: Slideshow}) => {
							const newSlideShow = new Slideshow({
								showTitle: true,
								cover: true,
								items: result.Items,
								"autoplayDelay": autoplayDelay,
								"swiperFX": swiperFX
							});

							newSlideShow.show();
							this.currentSlideshow = newSlideShow;
						}).catch(console.error);
					} else {
						// If current configuration doesn't bear any backdrop then fallback to a sober black screen.
						this.blackout_ON();
					}
				});
				break;
			
			case "Artists":
			case "ArtistsFav":
				query = {
					SortBy: 'Random',
                    Recursive: true,
                    Fields: 'PrimaryImageAspectRatio,SortName,BasicSyncInfo',
                    StartIndex: 0,
                    ImageTypeLimit: 1,
					Filters: filters,
                    EnableImageTypes: 'Backdrop',
					Limit: 200
				};
				apiClient = ServerConnections.currentApiClient();
				apiClient.getArtists(apiClient.getCurrentUserId(), query).then( (result) => {
					if (result.Items.length) {
						import('../../../components/slideshow/slideshow').then(({default: Slideshow}) => {
							const newSlideShow = new Slideshow({
								showTitle: true,
								cover: true,
								items: result.Items,
								"autoplayDelay": autoplayDelay,
								"swiperFX": swiperFX
							});

							newSlideShow.show();
							this.currentSlideshow = newSlideShow;
						}).catch(console.error);
					} else {
						// If current configuration doesn't bear any backdrop then fallback to a sober black screen.
						this.blackout_ON();
					}
				});
				break;
			
			default:
				this.blackout_ON();
		}	
	}

	hide() {
		if (this.currentSlideshow) {
			this.currentSlideshow.hide();
			this.currentSlideshow = null;
		} else
			this.blackout_OFF();
	
		return Promise.resolve();
	}
 }
/* eslint-enable indent */

export default BackdropScreensaver;
