import React, { FC, useCallback, useEffect, useRef } from 'react';
import IconButtonElement from '../../elements/IconButtonElement';
import { ViewQuerySettings } from '../../types/interface';
import SortMenu from '../sortmenu/sortmenu';

interface SortProps {
    getSortMenuOptions: () => {
        name: string;
        value: string;
    }[];
    viewQuerySettings: ViewQuerySettings;
    setViewQuerySettings: React.Dispatch<React.SetStateAction<ViewQuerySettings>>;
}

const Sort: FC<SortProps> = ({
    getSortMenuOptions,
    viewQuerySettings,
    setViewQuerySettings
}) => {
    const element = useRef<HTMLDivElement>(null);

	const checkSortMenu = useCallback(() => {
		const btnSort = element.current?.querySelector('.btnSort');
		if (btnSort) {
			const sortMenu = new SortMenu();
			const inUse = sortMenu.inUse({
				settings: viewQuerySettings,
			});
			if (inUse === true)
				btnSort.classList.add('inUse');
			else
				btnSort.classList.remove('inUse');
		}
	}, [viewQuerySettings]);
	
    const showSortMenu = useCallback(() => {
		const sortMenu = new SortMenu();
		sortMenu.show({
			settings: viewQuerySettings,
			sortOptions: getSortMenuOptions(),
			setSortValues: setViewQuerySettings
		});
    }, [getSortMenuOptions, viewQuerySettings, setViewQuerySettings]);

    useEffect(() => {
        const btnSort = element.current?.querySelector('.btnSort');
        btnSort?.addEventListener('click', showSortMenu);
		checkSortMenu();
        return () => { btnSort?.removeEventListener('click', showSortMenu); };
    }, [checkSortMenu]);

    return (
        <div ref={element}>
            <IconButtonElement
                is='paper-icon-button-light'
                className='btnSort autoSize'
                title='Sort'
                icon='material-icons sort_by_alpha'
            />
        </div>
    );
};

export default Sort;
