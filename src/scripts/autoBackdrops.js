import { clearBackdrop, setBackdrops, setBackdropImage, showBackdropWidget, hideBackdropWidget } from '../components/backdrop/backdrop';
import * as userSettings from './settings/userSettings';
import libraryMenu from './libraryMenu';
import { pageClassOn } from '../utils/dashboard';

var _cache = {};

function enabled() {
    return userSettings.enableBackdrops() != 'None';
}

function getBackdropItemIds(apiClient, userId, reqtypes, parentId) {
	let ImageTypes = 'Backdrop';
	let MaxOfficialRating = parentId ? '' : 'PG-13';
	let SortBy = 'Random';
	let types = reqtypes;
	let type = userSettings.enableBackdrops();
	let genreIds = '';
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
			types = "Movie,Series";
			break;
			
		case "Movie":
		case "MovieFav":
			types = "Movie";
			break;
			
		case "Series":
		case "SeriesFav":
			types = "Series";
			break;
			
		case "Artists":
		case "ArtistsFav":
			types = "MusicArtist";
			MaxOfficialRating = "";
			break;
	}
	
	switch(type) {
		case "Libraries":
		case "LibrariesFav":
		case "Movie":
		case "MovieFav":
		case "Series":
		case "SeriesFav":
		case "Artists":
		case "ArtistsFav":
			const key = `${userId}-${type}-${parentId || '#'}`;
			if (_cache[key]) {
				//console.debug(`Found backdrop id list in cache. Key: ${key}`);
				let imgs = _cache[key];
				return Promise.resolve(imgs);
			}
			const options = {
				SortBy: SortBy,
				Limit: 20,
				Recursive: true,
				IncludeItemTypes: types,
				ImageTypes: ImageTypes,
				ParentId: parentId,
				GenreIds: genreIds,
				Filters: filters,
				EnableTotalRecordCount: false,
				MaxOfficialRating: MaxOfficialRating
			};
			return apiClient.getItems(apiClient.getCurrentUserId(), options).then( res => {
				// filter out items without a tag.
				res = res.Items.filter( x => { return x.BackdropImageTags.length });
				if (res.length) {
					let imgs = res.map( x => {
						return {
							Id: x.Id,
							BackdropImageTags: x.BackdropImageTags,
							ServerId: x.ServerId
						};
					});
					_cache[key] = imgs;
					return imgs;
				}
			});
			break;
			
		default:
			return Promise.reject({});
	}
}

function showBackdrop(type, parentId) {
	const x = userSettings.enableBackdrops();
	switch(x) {
		case "Libraries":
		case "LibrariesFav":
		case "Movie":
		case "MovieFav":
		case "Series":
		case "SeriesFav":
		case "Artists":
		case "ArtistsFav":
			const apiClient = window.ApiClient;
			if (apiClient) {
				getBackdropItemIds(apiClient, apiClient.getCurrentUserId(), type, parentId).then( images => {
					if (images && images.length) {
						setBackdrops(images);
					} else {
						hideBackdropWidget();
						clearBackdrop();
					}
				}).catch( images => {
					hideBackdropWidget();
					clearBackdrop();
				});
			}
			break;
			
		case 'Theme':
			setTimeout(() => {
				setBackdropImage('#');
				hideBackdropWidget();}, 500);
			break;
	}
}

pageClassOn('pageshow', 'page', function () {
	const page = this;

	if (!page.classList.contains('selfBackdropPage')
		&& page.classList.contains('backdropPage')) {
		if (enabled()) {
			const type = page.getAttribute('data-backdroptype');
			const parentId = page.classList.contains('globalBackdropPage') ? '' : libraryMenu.getTopParentId();
			showBackdrop(type, parentId);
			return;
		} else
			page.classList.remove('backdropPage');
	}	
	hideBackdropWidget();
	clearBackdrop();
});

