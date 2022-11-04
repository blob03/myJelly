import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client';

export interface Query extends ViewQuerySettings {
    IncludeItemTypes?: string;
    Recursive?: boolean;
    Fields?: string | null;
    ImageTypeLimit?: number;
    EnableTotalRecordCount?: boolean;
    EnableImageTypes?: string;
    StartIndex?: number;
    ParentId?: string | null;
    IsMissing?: boolean | null;
    Limit?:number;
    Filters?: string | null;
}

export interface ViewQuerySettings {
    showTitle?: boolean;
    showYear?: boolean;
    imageType?: string;
    viewType?: string;
    cardLayout?: boolean;
    SortBy?: string | null;
    SortOrder?: string | null;
    IsPlayed?: boolean | null;
    IsUnplayed?: boolean | null;
    IsFavorite?: boolean | null;
    IsResumable?: boolean | null;
    Is4K?: boolean | null;
    IsHD?: boolean | null;
    IsSD?: boolean | null;
    Is3D?: boolean | null;
    VideoTypes?: string | null;
    SeriesStatus?: string | null;
    HasSubtitles?: boolean | null;
    HasTrailer?: boolean | null;
    HasSpecialFeature?: boolean | null;
    ParentIndexNumber?: boolean | null;
    HasThemeSong?: boolean | null;
    HasThemeVideo?: boolean | null;
    GenreIds?: string | null;
    NameLessThan?: string | null;
    NameStartsWith?: string | null;
    StartIndex?: number;
}

export interface CardOptions {
    itemsContainer?: HTMLElement | null;
    parentContainer?: HTMLElement | null;
    items?: BaseItemDto[] | null;
    allowBottomPadding?: boolean;
    centerText?: boolean;
    coverImage?: boolean;
    inheritThumb?: boolean;
    overlayMoreButton?: boolean;
    overlayPlayButton?: boolean;
    overlayText?: boolean;
    preferThumb?: boolean;
    preferDisc?: boolean;
    preferLogo?: boolean;
    scalable?: boolean;
    shape?: string | null;
    lazy?: boolean;
    cardLayout?: boolean | string;
    showParentTitle?: boolean;
    showParentTitleOrTitle?: boolean;
    showAirTime?: boolean;
    showAirDateTime?: boolean;
    showChannelName?: boolean;
    showTitle?: boolean | string;
    showYear?: boolean | string;
    showDetailsMenu?: boolean;
    missingIndicator?: boolean;
    showLocationTypeIndicator?: boolean;
    showSeriesYear?: boolean;
    showUnplayedIndicator?: boolean;
    showChildCountIndicator?: boolean;
    lines?: number;
    context?: string | null;
    action?: string | null;
    defaultShape?: string;
    indexBy?: string;
    parentId?: string | null;
    showMenu?: boolean;
    cardCssClass?: string | null;
    cardClass?: string | null;
    centerPlayButton?: boolean;
    overlayInfoButton?: boolean;
    autoUpdate?: boolean;
    cardFooterAside?: string;
    includeParentInfoInTitle?: boolean;
    maxLines?: number;
    overlayMarkPlayedButton?: boolean;
    overlayRateButton?: boolean;
    showAirEndTime?: boolean;
    showCurrentProgram?: boolean;
    showCurrentProgramTime?: boolean;
    showItemCounts?: boolean;
    showPersonRoleOrType?: boolean;
    showProgressBar?: boolean;
    showPremiereDate?: boolean;
    showRuntime?: boolean;
    showSeriesTimerTime?: boolean;
    showSeriesTimerChannel?: boolean;
    showSongCount?: boolean;
    width?: number;
    showChannelLogo?: boolean;
    showLogo?: boolean;
    serverId?: string;
    collectionId?: string | null;
    playlistId?: string | null;
    defaultCardImageIcon?: string;
    disableHoverMenu?: boolean;
    disableIndicators?: boolean;
    showGroupCount?: boolean;
    containerClass?: string;
    noItemsMessage?: string;
}

export interface LibraryViewProps {
    topParentId: string | null;
}
