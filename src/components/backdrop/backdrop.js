import isEqual from 'lodash-es/isEqual';
import browser from '../../scripts/browser';
import { playbackManager } from '../playback/playbackmanager';
import dom from '../../scripts/dom';
import * as userSettings from '../../scripts/settings/userSettings';
import ServerConnections from '../ServerConnections';

import './backdrop.scss';

/* eslint-disable indent */

    function enableAnimation() {
        if (browser.slow) {
            return false;
        }

        return true;
    }

    function enableRotation() {
        if (browser.tv) {
            return false;
        }

        // Causes high cpu usage
        if (browser.firefox) {
            return false;
        }

        return true;
    }

	class Backdrop {
		constructor(options) {
            this.options = options;
		}
		
		load(url, parent, existingBackdropImage) {
			const self = this;
			const backdropImage = document.createElement('div');
			const type = userSettings.enableBackdrops();

			switch(type) {
				case 'Theme':
					backdropImage.classList.add('backdropImage');
					backdropImage.classList.add('displayingBackdropImage');
					backdropImage.classList.add('themeBackdrop');
					const idx = Math.floor(Math.random() * 4);
					if (idx)
						backdropImage.classList.add('alt' + idx);
					backdropImage.classList.add('backdropImageFadeIn');
					parent.appendChild(backdropImage);
					internalBackdrop(true);
					return;
					break;
				
				case 'Libraries':
				case 'LibrariesFav':
				case 'Movie':
				case 'MovieFav':
				case 'Series':
				case 'SeriesFav':
				case 'Artists':
				case 'ArtistsFav':
					const img = new Image();
					backdropImage.style.backgroundImage = `url('${url}')`;
					backdropImage.setAttribute('data-url', url);
					img.onload = () => {
						if (self.isDestroyed)
							return;
						backdropImage.classList.add('backdropImage');
						backdropImage.classList.add('displayingBackdropImage');
						backdropImage.classList.add('backdropImageFadeIn');
						parent.appendChild(backdropImage);
						internalBackdrop(true);
						
						if (!enableAnimation()) {
							if (existingBackdropImage && existingBackdropImage.parentNode)
								existingBackdropImage.parentNode.removeChild(existingBackdropImage);
							return;
						}

						const onAnimationComplete = () => {
							dom.removeEventListener(backdropImage, dom.whichAnimationEvent(), onAnimationComplete, {
								once: true
							});
							if (backdropImage === self.currentAnimatingElement)
								self.currentAnimatingElement = null;
							if (existingBackdropImage && existingBackdropImage.parentNode)
								existingBackdropImage.parentNode.removeChild(existingBackdropImage);
						};

						dom.addEventListener(backdropImage, dom.whichAnimationEvent(), onAnimationComplete, {
							once: true
						});
					};
					img.src = url;
					break;
				
				default:
				case 'None':
					break;
			}
        }

        cancelAnimation() {
            const elem = this.currentAnimatingElement;
            if (elem) {
                elem.classList.remove('backdropImageFadeIn');
                this.currentAnimatingElement = null;
            }
        }

        destroy() {
            this.isDestroyed = true;
            this.cancelAnimation();
        }
    }

	function getBackdropContainer() {
		let ret = document.querySelector('.backdropContainer');
		if (!ret) {
			ret = document.createElement('div');
			ret.classList.add('backdropContainer');
			document.body.insertBefore(ret, document.body.firstChild);
		}
		return ret;
	}

    export function clearBackdrop(clearAll) {
        clearRotation();

        if (_currentInstance) {
            _currentInstance.destroy();
            _currentInstance = null;
        }

        const elem = getBackdropContainer();
        elem.innerHTML = '';

        if (clearAll) {
            _hasExternalBackdrop = false;
        }

        internalBackdrop(false);
    }

	function getBackgroundContainer() {
		const ret = document.querySelector('.backgroundContainer');
		return ret;
	}

	function setBackgroundContainerBackgroundEnabled() {
		let x = getBackgroundContainer();
		if (!x)
			return;
		x.classList.remove('withBackdrop');
		x.classList.remove('withThemeBackdrop');
		
		if (!_hasInternalBackdrop && !_hasExternalBackdrop)
			return;
		
		switch(userSettings.enableBackdrops()) {
			case 'Theme':
				x.classList.add('withThemeBackdrop');
				break;
				
			case 'Libraries':
			case 'LibrariesFav':
			case 'Movie':
			case 'MovieFav':
			case 'Series':
			case 'SeriesFav':
			case 'Artists':
			case 'ArtistsFav':
				x.classList.add('withBackdrop');
				break;
				
			default:
			case 'None':
				break;
		};
	}

	let _hasInternalBackdrop = false;
    function internalBackdrop(val) {
        _hasInternalBackdrop = val;
        setBackgroundContainerBackgroundEnabled();
    }
	
	let _hasExternalBackdrop = false;
    function externalBackdrop(val) {
        _hasExternalBackdrop = val;
        setBackgroundContainerBackgroundEnabled();
    }

    let _currentInstance;
    export function setBackdropImage(url) {
        if (_currentInstance) {
            _currentInstance.destroy();
            _currentInstance = null;
        }
        const elem = getBackdropContainer();
        const existingBackdropImage = elem.querySelector('.displayingBackdropImage');
        if (existingBackdropImage && existingBackdropImage.getAttribute('data-url') === url) {
            if (existingBackdropImage.getAttribute('data-url') === url) {
                return;
            }
            existingBackdropImage.classList.remove('displayingBackdropImage');
        }
        const instance = new Backdrop();
        instance.load(url, elem, existingBackdropImage);
        _currentInstance = instance;
    }

    function getItemImageUrls(item, imageOptions) {
        imageOptions = imageOptions || {}
        const apiClient = ServerConnections.getApiClient(item.ServerId);
		if (!apiClient)
			return [];
		
        if (item.BackdropImageTags && item.BackdropImageTags.length > 0) {
            return item.BackdropImageTags.map((imgTag, index) => {
                return apiClient.getScaledImageUrl(item.BackdropItemId || item.Id, Object.assign(imageOptions, {
                    type: 'Backdrop',
                    tag: imgTag,
                    maxWidth: dom.getScreenWidth(),
                    index: index
                }));
            });
        }

        if (item.ParentBackdropItemId && item.ParentBackdropImageTags && item.ParentBackdropImageTags.length) {
            return item.ParentBackdropImageTags.map((imgTag, index) => {
                return apiClient.getScaledImageUrl(item.ParentBackdropItemId, Object.assign(imageOptions, {
                    type: 'Backdrop',
                    tag: imgTag,
                    maxWidth: dom.getScreenWidth(),
                    index: index
                }));
            });
        }

        return [];
    }

    function getImageUrls(items, imageOptions) {
        const list = [];
        const onImg = img => {
            list.push(img);
        };

        for (let i = 0, length = items.length; i < length; i++) {
            const itemImages = getItemImageUrls(items[i], imageOptions);
            itemImages.forEach(onImg);
        }

        return list;
    }

    function enabled() {
        return userSettings.enableBackdrops();
    }

    let rotationInterval;
    let currentRotatingImages = [];
    let currentRotationIndex = -1;
    export function setBackdrops(items, imageOptions, enableImageRotation) {
        if (enabled()) {
            const images = getImageUrls(items, imageOptions);

            if (images.length) {
                startRotation(images, enableImageRotation);
            } else {
                clearBackdrop();
            }
        }
    }

    function startRotation(images, enableImageRotation) {
        if (isEqual(images, currentRotatingImages)) {
            return;
        }

        clearRotation();

        currentRotatingImages = images;
        currentRotationIndex = -1;

        if (images.length > 1 && enableImageRotation !== false && enableRotation()) {
            rotationInterval = setInterval(onRotationInterval, 24000);
        }

        onRotationInterval();
    }

    function onRotationInterval() {
        if (playbackManager.isPlayingLocally(['Video'])) {
            return;
        }

        let newIndex = currentRotationIndex + 1;
        if (newIndex >= currentRotatingImages.length) {
            newIndex = 0;
        }

        currentRotationIndex = newIndex;
        setBackdropImage(currentRotatingImages[newIndex]);
    }

    function clearRotation() {
        const interval = rotationInterval;
        if (interval) {
            clearInterval(interval);
        }

        rotationInterval = null;
        currentRotatingImages = [];
        currentRotationIndex = -1;
    }

    export function setBackdrop(url, imageOptions) {
        if (url && typeof url !== 'string') {
            url = getImageUrls([url], imageOptions)[0];
        }

        if (url) {
            clearRotation();
            setBackdropImage(url);
        } else {
            clearBackdrop();
        }
    }

/* eslint-enable indent */

/**
 * @enum TransparencyLevel
 */
export const TRANSPARENCY_LEVEL = {
    Full: 'full',
    Backdrop: 'backdrop',
    None: 'none'
};


/**
 * Sets the backdrop, background, and document transparency
 * @param {TransparencyLevel} level The level of transparency
 */
export function setBackdropTransparency(level) {
    const backdropElem = getBackdropContainer();
    const backgroundElem = getBackgroundContainer();

    if (level === TRANSPARENCY_LEVEL.Full || level === 2) {
        clearBackdrop(true);
        document.documentElement.classList.add('transparentDocument');
        backgroundElem.classList.add('backgroundContainer-transparent');
        backdropElem.classList.add('hide');
    } else if (level === TRANSPARENCY_LEVEL.Backdrop || level === 1) {
        externalBackdrop(true);
        document.documentElement.classList.add('transparentDocument');
        backgroundElem.classList.add('backgroundContainer-transparent');
        backdropElem.classList.add('hide');
    } else {
        externalBackdrop(false);
        document.documentElement.classList.remove('transparentDocument');
        backgroundElem.classList.remove('backgroundContainer-transparent');
        backdropElem.classList.remove('hide');
    }
}
