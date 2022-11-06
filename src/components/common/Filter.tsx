import React, { FC, useCallback, useEffect, useRef } from 'react';
import IconButtonElement from '../../elements/IconButtonElement';
import { ViewQuerySettings } from '../../types/interface';
import FilterMenu from '../filtermenu/filtermenu';

interface FilterProps {
    topParentId?: string | null;
    getItemTypes: () => string[];
    getFilterMenuOptions: () => Record<string, never>;
    getVisibleFilters: () => string[];
    viewQuerySettings: ViewQuerySettings;
    setViewQuerySettings: React.Dispatch<React.SetStateAction<ViewQuerySettings>>;
}

const Filter: FC<FilterProps> = ({
    topParentId,
    getItemTypes,
    getVisibleFilters,
    getFilterMenuOptions,
    viewQuerySettings,
    setViewQuerySettings
}) => {
    const element = useRef<HTMLDivElement>(null);

	const checkFilterMenu = useCallback(() => {
		const btnFilter = element.current?.querySelector('.btnFilter');
		const filterMenu = new FilterMenu();
		const inUse = filterMenu.inUse({
			settings: viewQuerySettings,
		});
		if (btnFilter) {
			if (inUse === true)
				btnFilter.classList.add('inUse');
			else
				btnFilter.classList.remove('inUse');
		}
	}, [viewQuerySettings]);

    const showFilterMenu = useCallback(() => {   
		const filterMenu = new FilterMenu();
		filterMenu.show({
			settings: viewQuerySettings,
			visibleSettings: getVisibleFilters(),
			parentId: topParentId,
			itemTypes: getItemTypes(),
			serverId: window.ApiClient.serverId(),
			filterMenuOptions: getFilterMenuOptions(),
			setfilters: setViewQuerySettings
		});
    }, [viewQuerySettings, getVisibleFilters, topParentId, getItemTypes, getFilterMenuOptions, setViewQuerySettings]);

    useEffect(() => {
        const btnFilter = element.current?.querySelector('.btnFilter');
        btnFilter?.addEventListener('click', showFilterMenu);
		checkFilterMenu();
        return () => {
            btnFilter?.removeEventListener('click', showFilterMenu);
        };
    }, [checkFilterMenu]);

    return (
        <div ref={element}>
            <IconButtonElement
                is='paper-icon-button-light'
                className='btnFilter autoSize'
                title='Filter'
                icon='material-icons filter_list'
            />
        </div>
    );
};

export default Filter;
