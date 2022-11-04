import '../../elements/emby-button/emby-button';
import '../../elements/emby-itemscontainer/emby-itemscontainer';

import type { BaseItemDtoQueryResult } from '@jellyfin/sdk/lib/generated-client';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';

import loading from '../loading/loading';
import { appRouter } from '../appRouter';
import cardBuilder from '../cardbuilder/cardBuilder';
import layoutManager from '../layoutManager';
import lazyLoader from '../lazyLoader/lazyLoaderIntersectionObserver';
import globalize from '../../scripts/globalize';
import { CardOptions, ViewQuerySettings } from '../../types/interface';
import ItemsScrollerContainerElement from '../../elements/ItemsScrollerContainerElement';
import ItemsContainerElement from '../../elements/ItemsContainerElement';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import SelectView from './SelectView';

const createLinkElement = ({ className, title, href }: { className?: string, title?: string | null, href?: string }) => ({
    __html: `<a
        is="emby-linkbutton"
        class="${className}"
        href="${href}"
        >
            <h2 class='sectionTitle sectionTitle-cards'>
                ${title}
            </h2>
            <span class='material-icons chevron_right' aria-hidden='true'></span>
    </a>`
});

interface GenresItemsContainerProps {
    topParentId?: string | null;
	getBasekey: () => string;
    itemsResult: BaseItemDtoQueryResult;
}

const getVisibleViewSettings = () => {
    return [
        'showTitle',
        'showYear',
        'imageType',
        'cardLayout'
    ];
};

const defaultViewQuerySettings: ViewQuerySettings = {
    showTitle: true,
    showYear: true,
    imageType: 'primary',
    viewType: '',
    cardLayout: true,
    SortBy:  'random',
    SortOrder: 'Ascending',
    IsPlayed: false,
    IsUnplayed: false,
    IsFavorite: false,
    IsResumable: false,
    Is4K: null,
    IsHD: null,
    IsSD: null,
    Is3D: null,
    VideoTypes: '',
    SeriesStatus: '',
    HasSubtitles: null,
    HasTrailer: null,
    HasSpecialFeature: null,
    HasThemeSong: null,
    HasThemeVideo: null,
    GenreIds: '',
    StartIndex: 0
};

const GenresItemsContainer: FC<GenresItemsContainerProps> = ({
    topParentId,
	getBasekey,
    itemsResult = {}
}) => {
    const element = useRef<HTMLDivElement>(null);

	const getSettingsKey = useCallback(() => {
        return `${topParentId} - ${getBasekey()}`;
    }, [getBasekey, topParentId]);
	
	const [ itemsResultx, setItemsResultx ] = useState<BaseItemDtoQueryResult>({});
	
    const [viewQuerySettings, setViewQuerySettings] = useLocalStorage<ViewQuerySettings>(
        `viewQuerySettings - ${getSettingsKey()}`,
        defaultViewQuerySettings
    );
	
    const enableScrollX = useCallback(() => {
        return !layoutManager.desktop;
    }, []);

    const getPortraitShape = useCallback(() => {
        return enableScrollX() ? 'overflowPortrait' : 'portrait';
    }, [enableScrollX]);

    const getCardOptions = useCallback((entry) => {
		const elem = entry.target;
        let shape;
        let preferThumb;
        let preferDisc;
        let preferLogo;

        if (viewQuerySettings.imageType === 'banner') {
            shape = 'banner';
        } else if (viewQuerySettings.imageType === 'disc') {
            shape = 'square';
            preferDisc = true;
        } else if (viewQuerySettings.imageType === 'logo') {
            shape = 'backdrop';
            preferLogo = true;
        } else if (viewQuerySettings.imageType === 'thumb') {
            shape = 'backdrop';
            preferThumb = true;
        } else {
            shape = 'autoVertical';
        }
        const cardOptions: CardOptions = {
			itemsContainer: elem,
			scalable: true,
            shape: shape,
            showTitle: viewQuerySettings.showTitle,
            showYear: viewQuerySettings.showYear,
            cardLayout: viewQuerySettings.cardLayout,
            centerText: true,
            context: 'movies',
            coverImage: true,
            preferThumb: preferThumb,
            preferDisc: preferDisc,
            preferLogo: preferLogo,
            overlayPlayButton: false,
            overlayMoreButton: true,
			allowBottomPadding: true
        };
        return cardOptions;
    }, [
		viewQuerySettings.imageType,
		viewQuerySettings.showTitle,
		viewQuerySettings.showYear,
		viewQuerySettings.cardLayout,
		itemsResult.Items,
		topParentId
	]);
	
    const fetchData = useCallback((entry) => {
		loading.show();
        const elem = entry.target;
        const id = elem.getAttribute('data-id');
        const query = {
            SortBy: 'Random',
            SortOrder: 'Ascending',
            IncludeItemTypes: 'Movie',
            Recursive: true,
            Fields: 'PrimaryImageAspectRatio,MediaSourceCount,BasicSyncInfo',
            ImageTypeLimit: 1,
            EnableImageTypes: 'Primary',
            Limit: 12,
            GenreIds: id,
            EnableTotalRecordCount: false,
            ParentId: topParentId
        };
        return window.ApiClient.getItems(window.ApiClient.getCurrentUserId(), query);
    }, [topParentId, itemsResult.Items]);

    const reloadItems = useCallback((entry) => {
        fetchData(entry).then((result) => {
			setItemsResultx(result);
            cardBuilder.buildCards(result.Items || [], getCardOptions(entry));
        }).finally(() => {loading.hide();});
    }, [fetchData, getCardOptions, itemsResult.Items]);
	
    useEffect(() => {
		const page = element.current;
		if (!page) {
            console.error('Unexpected null reference');
            return;
        }
		lazyLoader.lazyChildren(page, reloadItems);
    }, [reloadItems]);

    const items = itemsResult.Items || [];
    return (
		<div className='pageTabContent is-active' ref={element}>
			<div className='flex align-items-center justify-content-center flex-wrap-wrap padded-top padded-left padded-right padded-bottom focuscontainer-x'>
				
				<SelectView
					getVisibleViewSettings={getVisibleViewSettings}
					viewQuerySettings={viewQuerySettings}
					setViewQuerySettings={setViewQuerySettings}
				/>
				
			</div>
			
            {
                !items.length ? (
                    <div className='noItemsMessage centerMessage'>
                        <h1>{globalize.translate('MessageNothingHere')}</h1>
                        <p>{globalize.translate('MessageNoGenresAvailable')}</p>
                    </div>
                ) : items.map((item, index) => (
                    <div key={index} className='verticalSection'>
                        <div
                            className='sectionTitleContainer sectionTitleContainer-cards padded-left'
                            dangerouslySetInnerHTML={createLinkElement({
                                className: 'more button-flat button-flat-mini sectionTitleTextButton btnMoreFromGenre',
                                title: item.Name,
                                href: appRouter.getRouteUrl(item, {
                                    context: 'movies',
                                    parentId: topParentId
                                })
                            })}
                        />

                        {enableScrollX() ?
                            <ItemsScrollerContainerElement
                                scrollerclassName='padded-top-focusscale padded-bottom-focusscale'
                                dataMousewheel='false'
                                dataCenterfocus='true'
                                className='itemsContainer scrollSlider focuscontainer-x lazy'
                                dataId={item.Id}
                            /> : <ItemsContainerElement
                                className='itemsContainer vertical-wrap lazy padded-left padded-right'
                                dataId={item.Id}
                            />
                        }
                    </div>
                ))
            }
			
        </div>
    );
};

export default GenresItemsContainer;
