import { clearBackdrop, setBackdrops } from '../components/backdrop/backdrop';
import * as userSettings from './settings/userSettings';
import libraryMenu from './libraryMenu';
import { pageClassOn } from '../utils/dashboard';
import { appRouter } from '../components/appRouter';

const cache = {};
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
	let options;
	let images;
	
	switch(type) {
		case "LibrariesFav":
		case "MovieFav":
		case "SeriesFav":
		case "ArtistsFav":
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
	
    const key = `backdrops2_${userId + (type || '') + (parentId || '')}`;
    let data = cache[key];
    if (data) {
        //console.debug(`Found backdrop id list in cache. Key: ${key}`);
		showBackdropButton(_info_link_href[key]);
        data = JSON.parse(data);
        return Promise.resolve(data);
    }

	switch(type) {
		case "Libraries":
		case "LibrariesFav":
		case "Movie":
		case "MovieFav":
		case "Series":
		case "SeriesFav":
			options = {
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
			return apiClient.getItems(apiClient.getCurrentUserId(), options).then(function (result) {
				if (result.Items.length) {
					const _pageinfoUrl = appRouter.getRouteUrl(result.Items[0]) || '#';
					showBackdropButton(_pageinfoUrl);
						
					images = result.Items.map(function (i) {
						return {
							Id: i.Id,
							tag: i.BackdropImageTags[0],
							ServerId: i.ServerId
						};
					});
					cache[key] = JSON.stringify(images);
					_info_link_href[key] = _pageinfoUrl;
					return images;
				}
			});
			break;
			
		case "Artists":
		case "ArtistsFav":
			clearBackdropButton();
			options = {
				SortBy: SortBy,
				Limit: 20,
				Recursive: true,
				ImageTypes: ImageTypes,
				Filters: filters
			};
			return apiClient.getArtists(apiClient.getCurrentUserId(), options).then( (result) => {
				if (result.Items.length) {
					images = result.Items.map(function (i) {
						return {
							Id: i.Id,
							tag: i.BackdropImageTags[0],
							ServerId: i.ServerId
						};
					});
					cache[key] = JSON.stringify(images);
					return images;
				}
			});
			break;
	}
	
	clearBackdropButton();
	return new Promise(() => {
		images = {};
		return images;
	});
}

function showBackdrop(type, parentId) {
    const apiClient = window.ApiClient;
	
    if (apiClient) {
        getBackdropItemIds(apiClient, apiClient.getCurrentUserId(), type, parentId).then( function (images) {
            if (images && images.length) {
                setBackdrops(images.map(function (i) {
                    i.BackdropImageTags = [i.tag];
                    return i;
                }));
            } else {
				clearBackdropButton();
				clearBackdrop();
            }
        });
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

