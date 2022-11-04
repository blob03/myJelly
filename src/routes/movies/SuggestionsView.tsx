import type { BaseItemDto, BaseItemDtoQueryResult, RecommendationDto } from '@jellyfin/sdk/lib/generated-client';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { CardOptions, ViewQuerySettings } from '../../types/interface';
import layoutManager from '../../components/layoutManager';
import loading from '../../components/loading/loading';
import dom from '../../scripts/dom';
import globalize from '../../scripts/globalize';
import Shuffle from '../../components/common/Shuffle';
import SelectView from '../../components/common/SelectView';
import RecommendationContainer from '../../components/common/RecommendationContainer';
import SectionContainer from '../../components/common/SectionContainer';
import { LibraryViewProps } from '../../types/interface';

const getVisibleViewSettings = () => {
    return [
        'showTitle',
        'showYear',
        'imageType',
        'cardLayout'
    ];
};

const getDefaultSortBy = () => {
    return 'SortName,ProductionYear';
};

const defaultViewQuerySettings: ViewQuerySettings = {
    showTitle: true,
    showYear: true,
    imageType: 'primary',
    viewType: '',
    cardLayout: true,
};

const SuggestionsView: FC<LibraryViewProps> = ({topParentId}) => {
    const [ latestItems, setLatestItems ] = useState<BaseItemDto[]>([]);
    const [ resumeResult, setResumeResult ] = useState<BaseItemDtoQueryResult>({});
    const [ recommendations, setRecommendations ] = useState<RecommendationDto[]>([]);
    const element = useRef<HTMLDivElement>(null);

	const getBasekey = useCallback(() => {
        return 'moviesuggestions';
    }, []);
	
	const getSettingsKey = useCallback(() => {
        return `${topParentId} - ${getBasekey()}`;
    }, [getBasekey, topParentId]);
	
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
					
	const getShape = useCallback(() => {
		let shape = getPortraitShape();
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
		return {'shape': shape, 'preferThumb': preferThumb, 'preferDisc': preferDisc, 'preferLogo': preferLogo};
	}, [viewQuerySettings]);
	
    const getThumbShape = useCallback(() => {
        return enableScrollX() ? 'overflowBackdrop' : 'backdrop';
    }, [enableScrollX]);

    const autoFocus = useCallback((page) => {
        import('../../components/autoFocuser').then(({default: autoFocuser}) => {
            autoFocuser.autoFocus(page);
        });
    }, []);

    const loadResume = useCallback((page: HTMLDivElement, userId: string, parentId: string | null) => {
        loading.show();
        const screenWidth = dom.getWindowSize().innerWidth;
        const options = {
            SortBy: 'DatePlayed',
            SortOrder: 'Descending',
            IncludeItemTypes: 'Movie',
            Filters: 'IsResumable',
            Limit: screenWidth >= 1600 ? 5 : 3,
            Recursive: true,
            Fields: 'PrimaryImageAspectRatio,MediaSourceCount,BasicSyncInfo',
            CollapseBoxSetItems: false,
            ParentId: parentId,
            ImageTypeLimit: 1,
            EnableImageTypes: 'Primary,Backdrop,Banner,Thumb',
            EnableTotalRecordCount: false
        };
        window.ApiClient.getItems(userId, options).then(items => {
            setResumeResult(items);

            loading.hide();
            autoFocus(page);
        });
    }, [autoFocus]);

    const loadLatest = useCallback((page: HTMLDivElement, userId: string, parentId: string | null) => {
		const url = window.ApiClient.getUrl('Users/' + userId + '/Items/Latest', {
            IncludeItemTypes: 'Movie',
            Limit: 18,
            Fields: 'PrimaryImageAspectRatio,MediaSourceCount,BasicSyncInfo',
            ParentId: parentId,
            ImageTypeLimit: 1,
            EnableImageTypes: 'Primary,Backdrop,Banner,Thumb',
            EnableTotalRecordCount: false
        });
        window.ApiClient.getJSON(url).then(items => {
            setLatestItems(items);

            autoFocus(page);
        });
    }, [autoFocus]);

    const loadSuggestions = useCallback((page: HTMLDivElement, userId: string) => {
        const screenWidth = dom.getWindowSize().innerWidth;
        let itemLimit = 5;
        if (screenWidth >= 1600) {
            itemLimit = 8;
        } else if (screenWidth >= 1200) {
            itemLimit = 6;
        }
        const url = window.ApiClient.getUrl('Movies/Recommendations', {
            userId: userId,
            categoryLimit: 6,
            ItemLimit: itemLimit,
            Fields: 'PrimaryImageAspectRatio,MediaSourceCount,BasicSyncInfo',
            ImageTypeLimit: 1,
            EnableImageTypes: 'Primary,Backdrop,Banner,Thumb'
        });
        window.ApiClient.getJSON(url).then(items => {
            setRecommendations(items);

            autoFocus(page);
        });
    }, [autoFocus]);

    const loadSuggestionsTab = useCallback((view) => {
        const parentId = topParentId;
        const userId = window.ApiClient.getCurrentUserId();
        loadResume(view, userId, parentId);
		loadSuggestions(view, userId);
        loadLatest(view, userId, parentId);
    }, [loadLatest, loadResume, loadSuggestions, topParentId, viewQuerySettings]);

    useEffect(() => {
        const page = element.current;

        if (!page) {
            console.error('Unexpected null reference');
            return;
        }

        loadSuggestionsTab(page);
    }, [loadSuggestionsTab]);

    return (
        <div className='pageTabContent is-active' ref={element}>
			<div className='flex align-items-center justify-content-center flex-wrap-wrap padded-top padded-left padded-right padded-bottom focuscontainer-x'>
				
				<Shuffle itemsResult={resumeResult} topParentId={topParentId} />
				
				<SelectView
					getVisibleViewSettings={getVisibleViewSettings}
					viewQuerySettings={viewQuerySettings}
					setViewQuerySettings={setViewQuerySettings}
				/>
					
			</div>
			
            <SectionContainer
                sectionTitle={globalize.translate('HeaderContinueWatching')}
                enableScrollX={enableScrollX}
                items={resumeResult.Items || []}
                cardOptions={{
                    shape: getShape().shape,
					preferThumb: getShape().preferThumb,
					preferDisc: getShape().preferDisc,
					preferLogo: getShape().preferLogo,
					centerText: true,
                    showYear: viewQuerySettings.showYear,
					showTitle: viewQuerySettings.showTitle,
					cardLayout: viewQuerySettings.cardLayout
                }}
            />

            <SectionContainer
                sectionTitle={globalize.translate('HeaderLatestMovies')}
                enableScrollX={enableScrollX}
                items={latestItems}
                cardOptions={{
                    shape: getShape().shape,
					preferThumb: getShape().preferThumb,
					preferDisc: getShape().preferDisc,
					preferLogo: getShape().preferLogo,
					centerText: true,
                    showYear: viewQuerySettings.showYear,
					showTitle: viewQuerySettings.showTitle,
					cardLayout: viewQuerySettings.cardLayout
                }}
            />
				
            {!recommendations.length ? <div className='noItemsMessage centerMessage'>
                <h1>{globalize.translate('MessageNothingHere')}</h1>
                <p>{globalize.translate('MessageNoMovieSuggestionsAvailable')}</p>
            </div> : recommendations.map((recommendation, index) => {
                return <RecommendationContainer 
				key={index} 
				getPortraitShape={getPortraitShape} 
				enableScrollX={enableScrollX} 
				recommendation={recommendation}
				cardOptions={{
                    shape: getShape().shape,
					preferThumb: getShape().preferThumb,
					preferDisc: getShape().preferDisc,
					preferLogo: getShape().preferLogo,
					centerText: true,
                    showYear: viewQuerySettings.showYear,
					showTitle: viewQuerySettings.showTitle,
					cardLayout: viewQuerySettings.cardLayout
                }}
			/>;
            })}
        </div>
    );
};

export default SuggestionsView;
