import type { RecommendationDto } from '@jellyfin/sdk/lib/generated-client';
import React, { FC } from 'react';

import globalize from '../../scripts/globalize';
import SectionContainer from './SectionContainer';
import { CardOptions } from '../../types/interface';

interface RecommendationContainerProps {
    getPortraitShape: () => string;
    enableScrollX: () => boolean;
    recommendation?: RecommendationDto;
	cardOptions?: CardOptions;
}

const RecommendationContainer: FC<RecommendationContainerProps> = ({ getPortraitShape, enableScrollX, recommendation = {}, cardOptions = {} }) => {
    let title = '';

    switch (recommendation.RecommendationType) {
        case 'SimilarToRecentlyPlayed':
            title = globalize.translate('RecommendationBecauseYouWatched', recommendation.BaselineItemName);
            break;

        case 'SimilarToLikedItem':
            title = globalize.translate('RecommendationBecauseYouLike', recommendation.BaselineItemName);
            break;

        case 'HasDirectorFromRecentlyPlayed':
        case 'HasLikedDirector':
            title = globalize.translate('RecommendationDirectedBy', recommendation.BaselineItemName);
            break;

        case 'HasActorFromRecentlyPlayed':
        case 'HasLikedActor':
            title = globalize.translate('RecommendationStarring', recommendation.BaselineItemName);
            break;
    }

    return <SectionContainer
        sectionTitle={title}
        enableScrollX={enableScrollX}
        items={recommendation.Items || []}
        cardOptions={cardOptions}
    />;
};

export default RecommendationContainer;
