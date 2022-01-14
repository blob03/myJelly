import layoutManager from '../../components/layoutManager';
import loading from '../../components/loading/loading';
import libraryBrowser from '../../scripts/libraryBrowser';
import datetime from '../../scripts/datetime';
import * as userSettings from '../../scripts/settings/userSettings';
import cardBuilder from '../../components/cardbuilder/cardBuilder';
import listView from '../../components/listview/listview';
import imageLoader from '../../components/images/imageLoader';
import globalize from '../../scripts/globalize';
import '../../assets/css/scrollstyles.scss';
import '../../elements/emby-itemscontainer/emby-itemscontainer';

/* eslint-disable indent */
	export default function (view, params, tabContent) {

		let upcomingPromise;
		const self = this;
		const savedKey = params.topParentId;
		const savedViewKey = 'view-upcoming-' + savedKey;

		function getCurrentViewStyle() {
			return userSettings.get(savedViewKey) ||  'PosterCard';
		};
				
		function setCurrentViewStyle(viewStyle) {
			userSettings.set(savedViewKey, viewStyle);
			self.renderTab();
		};
		
		function getUpcomingPromise(context, params) {
			loading.show();
			const query = {
				Limit: 48,
				Fields: 'AirTime',
				UserId: ApiClient.getCurrentUserId(),
				ImageTypeLimit: 1,
				EnableImageTypes: 'Primary,Backdrop,Banner,Thumb',
				EnableTotalRecordCount: false
			};
			query.ParentId = params.topParentId;
			return ApiClient.getJSON(ApiClient.getUrl('Shows/Upcoming', query));
		}

		function loadUpcoming(context, params, promise) {
			promise.then(function (result) {
				const items = result.Items;

				if (items.length) {
					context.querySelector('.noItemsMessage').style.display = 'none';
				} else {
					context.querySelector('.noItemsMessage').style.display = 'block';
				}

				renderUpcoming(context.querySelector('#upcomingItems'), items);
				loading.hide();
			});
		}

		function enableScrollX() {
			return !layoutManager.desktop;
		}

		function getThumbShape() {
			return enableScrollX() ? 'overflowBackdrop' : 'backdrop';
		}

		function renderUpcoming(elem, items) {
			const groups = [];
			let currentGroupName = '';
			let currentGroup = [];

			for (let i = 0, length = items.length; i < length; i++) {
				const item = items[i];
				let dateText = '';

				if (item.PremiereDate) {
					try {
						const premiereDate = datetime.parseISO8601Date(item.PremiereDate, true);
						dateText = datetime.isRelativeDay(premiereDate, -1) ? globalize.translate('Yesterday') : datetime.toLocaleDateString(premiereDate, {
							weekday: 'long',
							month: 'short',
							day: 'numeric'
						});
					} catch (err) {
						console.error('error parsing timestamp for upcoming tv shows');
					}
				}

				if (dateText != currentGroupName) {
					if (currentGroup.length) {
						groups.push({
							name: currentGroupName,
							items: currentGroup
						});
					}

					currentGroupName = dateText;
					currentGroup = [item];
				} else {
					currentGroup.push(item);
				}
			}

			let html = '';

			for (let i = 0, length = groups.length; i < length; i++) {
				const group = groups[i];
				html += '<div class="verticalSection">';
				html += '<h2 class="sectionTitle sectionTitle-cards padded-left">' + group.name + '</h2>';
				let allowBottomPadding = true;

				if (enableScrollX()) {
					allowBottomPadding = false;
					let scrollXClass = 'scrollX hiddenScrollX';

					if (layoutManager.tv) {
						scrollXClass += ' smoothScrollX';
					}

					html += '<div is="emby-itemscontainer" class="itemsContainer ' + scrollXClass + ' padded-left padded-right">';
				} else 
					html += '<div is="emby-itemscontainer" class="itemsContainer vertical-wrap padded-left padded-right">';
				
				let viewStyle = getCurrentViewStyle();
				
				if (viewStyle == 'Thumb') {
					html += cardBuilder.getCardsHtml(group.items, {
						shape: 'backdrop',
						preferThumb: true,
						overlayMoreButton: true,
						centerText: true,
						showTitle: true,
						lazy: true,
						allowBottomPadding: allowBottomPadding,
						showDetailsMenu: true,
						showYear: true
					});
				} else if (viewStyle == 'ThumbCard') {
					html += cardBuilder.getCardsHtml(group.items, {
						shape: 'backdrop',
						preferThumb: true,
						overlayMoreButton: true,
						lazy: true,
						cardLayout: true,
						centerText: true,
						showTitle: true,
						showDetailsMenu: true,
						showYear: true
					});
				} else if (viewStyle == 'Banner') {
					html += cardBuilder.getCardsHtml(group.items, {
						shape: 'banner',
						overlayMoreButton: true,
						preferBanner: true,
						centerText: true,
						showTitle: false,
						allowBottomPadding: allowBottomPadding,
						showYear: false,
						showDetailsMenu: true,
						lazy: true
					});
				} else if (viewStyle == 'List') {
					elem.classList.add('vertical-list');
					elem.classList.remove('vertical-wrap');
				
					html += listView.getListViewHtml({
						items: group.items
					});
				} else if (viewStyle == 'PosterCard') {
					html += cardBuilder.getCardsHtml(group.items, {
						shape: 'auto',
						showTitle: true,
						showYear: true,
						lazy: true,
						overlayMoreButton: true,
						centerText: true,
						showDetailsMenu: true,
						cardLayout: true
					});
				} else {
					html += cardBuilder.getCardsHtml(group.items, {
						shape: 'auto',
						overlayMoreButton: true,
						allowBottomPadding: allowBottomPadding,
						centerText: true,
						showYear: true,
						lazy: true,
						showDetailsMenu: true,
						showTitle: true
					});
				}
						
				html += '</div>';
				html += '</div>';
			}

			elem.innerHTML = html;
			imageLoader.lazyChildren(elem);
		}

        self.preRender = function () {
            upcomingPromise = getUpcomingPromise(view, params);
        };

        self.renderTab = function () {
            loadUpcoming(tabContent, params, upcomingPromise);
        };
		
		const btnSelectView = tabContent.querySelector('.btnSelectView');
		btnSelectView.addEventListener('click', (e) => {
			libraryBrowser.showLayoutMenu(e.target, getCurrentViewStyle(), 'Banner,List,Poster,PosterCard,Thumb,ThumbCard'.split(','));
		});
		btnSelectView.addEventListener('layoutchange', function (e) {
			const viewStyle = e.detail.viewStyle;
			setCurrentViewStyle(viewStyle);
		});
    }

/* eslint-enable indent */
