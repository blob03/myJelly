import escapeHTML from 'escape-html';
import React, { FunctionComponent } from 'react';
import globalize from '../scripts/globalize';

const createCheckBoxElement = ({ labelClassName, className, id, dataFilter, dataItemType, dataId, checkedAttribute, renderContent }: { labelClassName?: string, type?: string, className?: string, id?: string, dataFilter?: string, dataItemType?: string, dataId?: string, checkedAttribute?: string, renderContent?: string }) => ({
    __html: `<label ${labelClassName}>
        <input
            is="emby-checkbox"
            type="checkbox"
            class="${className}"
            ${id}
            ${dataFilter}
            ${dataItemType}
            ${dataId}
            ${checkedAttribute}
        />
        ${renderContent}
    </label>`
});

type IProps = {
    labelClassName?: string;
    className?: string;
    elementId?: string;
    dataFilter?: string;
    itemType?: string;
    itemId?: string;
    itemAppName?: string;
	itemAppVersion?: string;
    itemCheckedAttribute?: string;
    itemName?: string
    title?: string
}

const CheckBoxElement: FunctionComponent<IProps> = ({ labelClassName, className, elementId, dataFilter, itemType, itemId, itemAppName, itemAppVersion, itemCheckedAttribute, itemName, title }: IProps) => {
    const appName = itemAppName ? `- ${itemAppName}` : '';
	const appVersion = itemAppVersion ? ` ${itemAppVersion}` : '';
    const renderContent = itemName ?
        `<span>${escapeHTML(itemName || '')} ${appName}${appVersion}</span>` :
        `<span>${globalize.translate(title)}</span>`;

    return (
        <div
            className='sectioncheckbox'
            dangerouslySetInnerHTML={createCheckBoxElement({
                labelClassName: labelClassName ? `class='${labelClassName}'` : '',
                className: className,
                id: elementId ? `id='${elementId}'` : '',
                dataFilter: dataFilter ? `data-filter='${dataFilter}'` : '',
                dataItemType: itemType ? `data-itemtype='${itemType}'` : '',
                dataId: itemId ? `data-id='${itemId}'` : '',
                checkedAttribute: itemCheckedAttribute ? itemCheckedAttribute : '',
                renderContent: renderContent
            })}
        />
    );
};

export default CheckBoxElement;
