import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client';
import type { ApiClient } from 'jellyfin-apiclient';
import classNames from 'classnames';
import React, { FunctionComponent, useEffect, useState } from 'react';

import globalize from '../../scripts/globalize';
import * as userSettings from '../../scripts/settings/userSettings';
import ServerConnections from '../ServerConnections';
import SearchResultsRow from './SearchResultsRow';

type SearchResultsProps = {
    serverId?: string;
    parentId?: string | null;
    collectionType?: string | null;
    query?: string;
}

/*
 * React component to display search result rows for global search and non-live tv library search
 */
const SearchResults: FunctionComponent<SearchResultsProps> = ({ serverId = window.ApiClient.serverId(), parentId, collectionType, query }: SearchResultsProps) => {
    const [ movies, setMovies ] = useState<BaseItemDto[]>([]);
    const [ shows, setShows ] = useState<BaseItemDto[]>([]);
    const [ episodes, setEpisodes ] = useState<BaseItemDto[]>([]);
    const [ videos, setVideos ] = useState<BaseItemDto[]>([]);
    const [ programs, setPrograms ] = useState<BaseItemDto[]>([]);
    const [ channels, setChannels ] = useState<BaseItemDto[]>([]);
    const [ playlists, setPlaylists ] = useState<BaseItemDto[]>([]);
    const [ artists, setArtists ] = useState<BaseItemDto[]>([]);
    const [ albums, setAlbums ] = useState<BaseItemDto[]>([]);
    const [ songs, setSongs ] = useState<BaseItemDto[]>([]);
    const [ photoAlbums, setPhotoAlbums ] = useState<BaseItemDto[]>([]);
    const [ photos, setPhotos ] = useState<BaseItemDto[]>([]);
    const [ audioBooks, setAudioBooks ] = useState<BaseItemDto[]>([]);
    const [ books, setBooks ] = useState<BaseItemDto[]>([]);
    const [ people, setPeople ] = useState<BaseItemDto[]>([]);
	const [ collections, setCollections ] = useState<BaseItemDto[]>([]);
	const [ cardLayout, setCardLayout ] = useState(false);
	
    useEffect(() => {
        const getDefaultParameters = () => ({
            ParentId: parentId,
            searchTerm: query,
            Limit: 24,
            Fields: 'PrimaryImageAspectRatio,CanDelete,BasicSyncInfo,MediaSourceCount',
            Recursive: true,
            EnableTotalRecordCount: false,
            ImageTypeLimit: 1,
            IncludePeople: false,
            IncludeMedia: false,
            IncludeGenres: false,
            IncludeStudios: false,
            IncludeArtists: false
        });

        const fetchArtists = (apiClient: ApiClient, params = {}) => apiClient?.getArtists(
            apiClient?.getCurrentUserId(),
            {
                ...getDefaultParameters(),
                IncludeArtists: true,
                ...params
            }
        );

        const fetchItems = (apiClient: ApiClient, params = {}) => apiClient?.getItems(
            apiClient?.getCurrentUserId(),
            {
                ...getDefaultParameters(),
                IncludeMedia: true,
                ...params
            }
        );

        const fetchPeople = (apiClient: ApiClient, params = {}) => apiClient?.getPeople(
            apiClient?.getCurrentUserId(),
            {
                ...getDefaultParameters(),
                IncludePeople: true,
                ...params
            }
        );

        const isMovies = () => collectionType === 'movies';

        const isMusic = () => collectionType === 'music';

        const isTVShows = () => collectionType === 'tvshows' || collectionType === 'tv';

        // Reset state
        setMovies([]);
        setShows([]);
        setEpisodes([]);
        setVideos([]);
        setPrograms([]);
        setChannels([]);
        setPlaylists([]);
        setArtists([]);
        setAlbums([]);
        setSongs([]);
        setPhotoAlbums([]);
        setPhotos([]);
        setAudioBooks([]);
        setBooks([]);
        setPeople([]);
		setCollections([]);
		setCardLayout(userSettings.useCardLayoutInHomeSections(undefined) || false);

        if (query) {
            const apiClient = ServerConnections['getApiClient'](serverId);

            // Movie libraries
            if (!collectionType || isMovies()) {
                // Movies row
                fetchItems(apiClient, { IncludeItemTypes: 'Movie' })
                    .then(result => setMovies(result.Items || []));
            }

            // TV Show libraries
            if (!collectionType || isTVShows()) {
                // Shows row
                fetchItems(apiClient, { IncludeItemTypes: 'Series' })
                    .then(result => setShows(result.Items || []));
                // Episodes row
                fetchItems(apiClient, { IncludeItemTypes: 'Episode' })
                    .then(result => setEpisodes(result.Items || []));
            }

            // People are included for Movies and TV Shows
            if (!collectionType || isMovies() || isTVShows()) {
                // People row
                fetchPeople(apiClient).then(result => setPeople(result.Items || []));
            }

            // Music libraries
            if (!collectionType || isMusic()) {
                // Playlists row
                fetchItems(apiClient, { IncludeItemTypes: 'Playlist' })
                    .then(results => setPlaylists(results.Items || []));
                // Artists row
                fetchArtists(apiClient).then(result => setArtists(result.Items || []));
                // Albums row
                fetchItems(apiClient, { IncludeItemTypes: 'MusicAlbum' })
                    .then(result => setAlbums(result.Items || []));
                // Songs row
                fetchItems(apiClient, { IncludeItemTypes: 'Audio' })
                    .then(result => setSongs(result.Items || []));
            }

            // Other libraries do not support in-library search currently
            if (!collectionType) {
                // Videos row
                fetchItems(apiClient, {
                    MediaTypes: 'Video',
                    ExcludeItemTypes: 'Movie,Episode,TvChannel'
                }).then(result => setVideos(result.Items || []));
                // Programs row
                fetchItems(apiClient, { IncludeItemTypes: 'LiveTvProgram' })
                    .then(result => setPrograms(result.Items || []));
                // Channels row
                fetchItems(apiClient, { IncludeItemTypes: 'TvChannel' })
                    .then(result => setChannels(result.Items || []));
                // Photo Albums row
                fetchItems(apiClient, { IncludeItemTypes: 'PhotoAlbum' })
                    .then(results => setPhotoAlbums(results.Items || []));
                // Photos row
                fetchItems(apiClient, { IncludeItemTypes: 'Photo' })
                    .then(results => setPhotos(results.Items || []));
                // Audio Books row
                fetchItems(apiClient, { IncludeItemTypes: 'AudioBook' })
                    .then(results => setAudioBooks(results.Items || []));
                // Books row
                fetchItems(apiClient, { IncludeItemTypes: 'Book' })
                    .then(results => setBooks(results.Items || []));
				// Collections row
                fetchItems(apiClient, { IncludeItemTypes: 'BoxSet' })
                    .then(result => setCollections(result.Items || []));
            }
        }
    }, [collectionType, parentId, query, serverId]);

    return (
        <div
            className={classNames(
                'searchResults',
                'padded-bottom-page',
                'padded-top',
                { 'hide': !query || collectionType === 'livetv' }
            )}
        >
            <SearchResultsRow
                title={globalize.translate('Movies')}
                items={movies}
                cardOptions={{ showYear: true, cardLayout: cardLayout }}
            />
            <SearchResultsRow
                title={globalize.translate('Shows')}
                items={shows}
                cardOptions={{ showYear: true, cardLayout: cardLayout }}
            />
            <SearchResultsRow
                title={globalize.translate('Episodes')}
                items={episodes}
                cardOptions={{
                    coverImage: true,
                    showParentTitle: true, cardLayout: cardLayout
                }}
            />
            <SearchResultsRow
                title={globalize.translate('HeaderVideos')}
                items={videos}
                cardOptions={{ showParentTitle: true, cardLayout: cardLayout }}
            />
            <SearchResultsRow
                title={globalize.translate('Programs')}
                items={programs}
                cardOptions={{
                    preferThumb: true,
                    inheritThumb: false,
                    showParentTitleOrTitle: true,
                    showTitle: false,
                    coverImage: true,
                    overlayMoreButton: true,
                    showAirTime: true,
                    showAirDateTime: true,
                    showChannelName: true, cardLayout: cardLayout
                }}
            />
            <SearchResultsRow
                title={globalize.translate('Channels')}
                items={channels}
                cardOptions={{ shape: 'square' }}
            />
            <SearchResultsRow
                title={globalize.translate('Playlists')}
                items={playlists}
				cardOptions={{ cardLayout: cardLayout }}
            />
            <SearchResultsRow
                title={globalize.translate('Artists')}
                items={artists}
                cardOptions={{ coverImage: true, cardLayout: cardLayout }}
            />
            <SearchResultsRow
                title={globalize.translate('Albums')}
                items={albums}
                cardOptions={{ showParentTitle: true, cardLayout: cardLayout }}
            />
            <SearchResultsRow
                title={globalize.translate('Songs')}
                items={songs}
                cardOptions={{ showParentTitle: true, cardLayout: cardLayout }}
            />
            <SearchResultsRow
                title={globalize.translate('HeaderPhotoAlbums')}
                items={photoAlbums}
				cardOptions={{ cardLayout: cardLayout }}
            />
            <SearchResultsRow
                title={globalize.translate('Photos')}
                items={photos}
				cardOptions={{ cardLayout: cardLayout }}
            />
            <SearchResultsRow
                title={globalize.translate('HeaderAudioBooks')}
                items={audioBooks}
				cardOptions={{ cardLayout: cardLayout }}
            />
            <SearchResultsRow
                title={globalize.translate('Books')}
                items={books}
				cardOptions={{ cardLayout: cardLayout }}
            />
			<SearchResultsRow
                title={globalize.translate('Collections')}
                items={collections}
				cardOptions={{ cardLayout: cardLayout }}
            />
            <SearchResultsRow
                title={globalize.translate('People')}
                items={people}
                cardOptions={{ coverImage: true, cardLayout: cardLayout }}
            />
        </div>
    );
};

export default SearchResults;
