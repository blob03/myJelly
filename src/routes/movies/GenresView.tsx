import type { BaseItemDtoQueryResult } from '@jellyfin/sdk/lib/generated-client';
import React, { FC, useCallback, useEffect, useState } from 'react';

import loading from '../../components/loading/loading';
import GenresItemsContainer from '../../components/common/GenresItemsContainer';
import { LibraryViewProps } from '../../types/interface';

const GenresView: FC<LibraryViewProps> = ({ topParentId }) => {
	
	const getBasekey = useCallback(() => {
        return 'movieGenres';
    }, []);
	
    const [ itemsResult, setItemsResult ] = useState<BaseItemDtoQueryResult>({});

    const reloadItems = useCallback(() => {
        loading.show();
        window.ApiClient.getGenres(
            window.ApiClient.getCurrentUserId(),
            {
                SortBy: 'SortName',
                SortOrder: 'Ascending',
                IncludeItemTypes: 'Movie',
                Recursive: true,
                EnableTotalRecordCount: false,
                ParentId: topParentId
            }
        ).then((result) => {
            setItemsResult(result);
            loading.hide();
        });
    }, [topParentId]);

    useEffect(() => {
        reloadItems();
    }, [reloadItems]);

    return (
        <GenresItemsContainer
            topParentId={topParentId}
			getBasekey={getBasekey}
            itemsResult={itemsResult}
        />
    );
};

export default GenresView;
