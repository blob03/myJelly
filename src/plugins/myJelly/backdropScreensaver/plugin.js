/* eslint-disable indent */
import ServerConnections from '../../../components/ServerConnections';
import * as userSettings from '../../../scripts/settings/userSettings';

class BackdropScreensaver {
    constructor() {
        this.name = 'My Backdrop Player';
		this.version = '1.2';
		this.group = 'myJelly';
		this.description = 'MJBackdropScreensaverHelp';
        this.type = 'screensaver';
        this.id = 'mJbackdropscreensaver';
        this.supportsAnonymous = false;
    }
	
	show() {
		let type = userSettings.enableBackdrops();
		let types = 'Movie,Series,MusicArtist';
		let filters = '';

		switch(type) {
			case "LibrariesFav":
			case "MovieFav":			
			case "SeriesFav":
				filters = 'IsFavorite';
				break;
		}

		switch(type) {	
			case "Movie":
			case "MovieFav":
				types = "Movie";
				break;

			case "Series":
			case "SeriesFav":
				types = "Series";
				break;
		}

		const query = {
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

		const apiClient = ServerConnections.currentApiClient();
		apiClient.getItems(apiClient.getCurrentUserId(), query).then( (result) => {
			if (result.Items.length) {
				import('../../../components/slideshow/slideshow').then(({default: Slideshow}) => {
					const newSlideShow = new Slideshow({
						showTitle: true,
						cover: true,
						items: result.Items
					});

					newSlideShow.show();
					this.currentSlideshow = newSlideShow;
				}).catch(console.error);
			} else {
				// If current configuration doesn't bear any result just fallback to a black screen.
				import('./style.scss').then(() => {
					let elem = document.createElement('div');
					elem.classList.add('blackout');
					document.body.appendChild(elem);
				});
			}
		});
	}

	hide() {
		if (this.currentSlideshow) {
			this.currentSlideshow.hide();
			this.currentSlideshow = null;
		} else {
			const elem = document.querySelector('.blackout');
			if (elem) {
				return new Promise((resolve) => {
					elem.parentNode.removeChild(elem);
					resolve();
				});
			}
		}
		return Promise.resolve();
	}
 }
/* eslint-enable indent */

export default BackdropScreensaver;
