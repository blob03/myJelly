import type { BaseItemDtoQueryResult } from '@jellyfin/sdk/lib/generated-client';
import React, { FC, useCallback, useEffect, useRef } from 'react';

import { playbackManager } from '../playback/playbackmanager';
import IconButtonElement from '../../elements/IconButtonElement';

interface ShuffleProps {
    itemsResult?: BaseItemDtoQueryResult;
    topParentId: string | null;
}

const Shuffle: FC<ShuffleProps> = ({ itemsResult = {}, topParentId }) => {
    const element = useRef<HTMLDivElement>(null);

    const shuffle = useCallback(() => {
		if (itemsResult?.Items) {
			const len = itemsResult.Items.length;
			if (len > 0) {
				const idx = Math.floor(Math.random() * len);
				playbackManager.shuffle(itemsResult.Items[idx]);
			}
		}
    }, [itemsResult, topParentId]);

    useEffect(() => {
        const btnShuffle = element.current?.querySelector('.btnShuffle') as HTMLButtonElement;
        btnShuffle?.addEventListener('click', shuffle);
		
		return () => { btnShuffle?.removeEventListener('click', shuffle); };
    }, [shuffle]);

    return (
        <div ref={element}>
            <IconButtonElement
                is='paper-icon-button-light'
                className='btnShuffle autoSize'
                title='Shuffle'
                icon='material-icons shuffle'
            />
        </div>
    );
};

export default Shuffle;
