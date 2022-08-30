import { clearBackdrop, setBackdrops, setBackdropImage } from '../components/backdrop/backdrop';
import * as userSettings from './settings/userSettings';
import libraryMenu from './libraryMenu';
import { pageClassOn } from '../utils/dashboard';
import { appRouter } from '../components/appRouter';

const _cache = {};
const _info_link_href = {};

function enabled() {
    return userSettings.enableBackdrops() != 'None';
}

function clearBackdropButton() {
	const _bdi =  document.querySelector('#backdropInfoButton');
	if (_bdi) {
		_bdi.classList.add('hide');
		_bdi.href = '#';
	}
}

function showBackdropButton(_item_url) {
	const _bdi =  document.querySelector('#backdropInfoButton');
	if (_bdi && _item_url) {
		_bdi.href = _item_url;
		_bdi.classList.remove('hide');
	}
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
			types = "Movie.Series";
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
			const key = `backdrops2_${userId + (type || '') + (parentId || '')}`;
			let data = _cache[key];
			if (data) {
				//console.debug(`Found backdrop id list in cache. Key: ${key}`);
				showBackdropButton(_info_link_href[key]);
				data = JSON.parse(data);
				return Promise.resolve(data);
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
					const _pageinfoUrl = appRouter.getRouteUrl(res[0]) || '#';
					showBackdropButton(_pageinfoUrl);
					const images = res.map( x => {
						return {
							Id: x.Id,
							BackdropImageTags: x.BackdropImageTags,
							ServerId: x.ServerId
						};
					});
					_cache[key] = JSON.stringify(images);
					_info_link_href[key] = _pageinfoUrl;
					return images;
				}
			});
			break;
			
		default:
			return new Promise((resolve, reject) => {
				const images = {};
				reject(images);
			});
	}
}

function showBackdrop(type, parentId) {
	const btype = userSettings.enableBackdrops();
	switch(btype) {
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
						clearBackdropButton();
						clearBackdrop();
					}
				}).catch( images => {
					clearBackdropButton();
					clearBackdrop();
				});
			}
			break;
			
		case 'Theme':
			setBackdropImage('#');
			clearBackdropButton();
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
		} else {
			page.classList.remove('backdropPage');
			clearBackdropButton();
			clearBackdrop();
		}
	} else {
		clearBackdropButton();
		clearBackdrop();
	}
});

