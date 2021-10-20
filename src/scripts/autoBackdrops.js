import backdrop from '../components/backdrop/backdrop';
import * as userSettings from './settings/userSettings';
import libraryMenu from './libraryMenu';
import { pageClassOn } from './clientUtils';

const cache = {};

function enabled() {
    return userSettings.enableBackdrops();
}

function getBackdropItemIds(apiClient, userId, types, parentId) {
	let ImageTypes = 'Backdrop';
	let MaxOfficialRating = parentId ? '' : 'PG-13';
	let SortBy = 'IsFavoriteOrLiked,Random';
	let type = userSettings.enableBackdrops();
	let genreIds = '';
	
	switch(type) {
		case "Movie":			
		case "Series":
			break;
		
		default:
			type = types;
			break;
	}
	
    const key = `backdrops2_${userId + (type || '') + (parentId || '')}`;
    let data = cache[key];
    if (data) {
        console.debug(`Found backdrop id list in cache. Key: ${key}`);
        data = JSON.parse(data);
        return Promise.resolve(data);
    }

    const options = {
        SortBy: SortBy,
        Limit: 20,
        Recursive: true,
        IncludeItemTypes: type,
        ImageTypes: ImageTypes,
        ParentId: parentId,
		GenreIds: genreIds,
        EnableTotalRecordCount: false,
        MaxOfficialRating: MaxOfficialRating
    };
    return apiClient.getItems(apiClient.getCurrentUserId(), options).then(function (result) {
        const images = result.Items.map(function (i) {
            return {
                Id: i.Id,
                tag: i.BackdropImageTags[0],
                ServerId: i.ServerId
            };
        });
        cache[key] = JSON.stringify(images);
        return images;
    });
}

function showBackdrop(type, parentId) {
    const apiClient = window.ApiClient;

    if (apiClient) {
        getBackdropItemIds(apiClient, apiClient.getCurrentUserId(), type, parentId).then(function (images) {
            if (images.length) {
                backdrop.setBackdrops(images.map(function (i) {
                    i.BackdropImageTags = [i.tag];
                    return i;
                }));
            } else {
                backdrop.clearBackdrop();
            }
        });
    }
}

pageClassOn('pageshow', 'page', function () {
    const page = this;

    if (!page.classList.contains('selfBackdropPage')) {
        if (page.classList.contains('backdropPage')) {
            if (enabled()) {
                const type = page.getAttribute('data-backdroptype');
                const parentId = page.classList.contains('globalBackdropPage') ? '' : libraryMenu.getTopParentId();
                showBackdrop(type, parentId);
            } else {
                page.classList.remove('backdropPage');
                backdrop.clearBackdrop();
            }
        } else {
            backdrop.clearBackdrop();
        }
    }
});

