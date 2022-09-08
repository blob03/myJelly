import isEqual from 'lodash-es/isEqual';
import browser from '../../scripts/browser';
import { playbackManager } from '../playback/playbackmanager';
import dom from '../../scripts/dom';
import globalize from '../../scripts/globalize';
import * as userSettings from '../../scripts/settings/userSettings';
import ServerConnections from '../ServerConnections';
import { appRouter } from '../appRouter';
import toast from '../toast/toast';


import './backdrop.scss';

/* eslint-disable indent */

    function enableAnimation() {
        if (browser.slow) {
            return false;
        }

        return true;
    }

    function enableRotation() {
		// if (browser.tv) {
		//    return false;
		// }

		// Causes high cpu usage
		//  if (browser.firefox) {
		//     return false;
		//}
        return true;
    }

	class Backdrop {
		constructor() {
		}
		
		load(url, parent, existingBackdropImage) {
			const self = this;
			const type = userSettings.enableBackdrops();

			switch(type) {
				case 'Theme':
					let backdropImage = document.createElement('div');
					
					backdropImage.classList.add('backdropImage', 'displayingBackdropImage', 'backdropImageFadeIn', 'themeBackdrop');
					backdropImage.setAttribute('data-url', url);
					const idx = Math.floor(Math.random() * 4);
					if (idx)
						backdropImage.classList.add('alt' + idx);
					
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
					img.onload = () => {
						if (self.isDestroyed)
							return;
						let backdropImage = document.createElement('div');
						if (backdropImage) {
							backdropImage.classList.add('backdropImage', 'displayingBackdropImage', 'backdropImageFadeIn');
							backdropImage.style.backgroundImage = `url('${url}')`;
							backdropImage.setAttribute('data-url', url);
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
						}
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
        if (_instance)
            _instance.destroy();
        _instance = null;

        let elem = getBackdropContainer();
        elem.innerHTML = '';

        if (clearAll)
            _hasExternalBackdrop = false;

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

	var _hasInternalBackdrop = false;
	var _hasExternalBackdrop = false;
    
	function internalBackdrop(val) {
		_hasInternalBackdrop = (val === true);
        setBackgroundContainerBackgroundEnabled();
    }
	
    function externalBackdrop(val) {
		_hasExternalBackdrop = (val === true);
        setBackgroundContainerBackgroundEnabled();
    }

    var _instance = null;
    export function setBackdropImage(url) {
        if (_instance) {
            _instance.destroy();
            _instance = null;
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
        _instance = instance;
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
		const lot = {details: [], list: []};
		
        for (let i = 0, length = items.length; i < length; i++) {
			lot.list[i] = [];
            const imgs = getItemImageUrls(items[i], imageOptions);
            imgs.forEach( img => {
				lot.list[i].push(img) } );
			lot.details[i] = appRouter.getRouteUrl(items[i]) || '#';
        }

        return lot;
    }

    function enabled() {
        return userSettings.enableBackdrops();
    }

    var _rotationInterval;
    var _currentRotatingImages = {details: [], list: []};
    var _currentRotationIndex  = -1;
	
    export function setBackdrops(items, imageOptions, enableImageRotation) {
        if (enabled()) {
            const images = getImageUrls(items, imageOptions);

            if (images.list.length) {
                startRotation(images, enableImageRotation);
            } else {
                clearBackdrop();
            }
        }
    }

    function startRotation(images, enableImageRotation) {
        clearRotation();
        
        if (images.list.length > 1 && enableImageRotation !== false && enableRotation()) {
			
			if (!isEqual(images.list, _currentRotatingImages.list)) {
				_currentRotatingImages = { ...images };
				_currentRotationIndex = -1;
				//console.debug("Fresh backdrop lot loaded.");
			} else
				--_currentRotationIndex;

			const _delay = userSettings.backdropDelay();
			if (_delay && !_onPause) {
				clearInterval(_rotationInterval);
				_rotationInterval = setInterval(onRotationInterval, _delay * 1000);
			}
			onRotationInterval();
			return;
        }

        setBackdropImage(images.list[0]);
		hideBackdropWidget();
    }
	
	var _onPause = false;
	export function showBackdropWidget(_item_url) {
		const _bdw =  document.querySelector('#backdropWidget');
		const _bdc =  document.querySelector('#backdropControlButton');
		const _bdi =  document.querySelector('#backdropInfoButton');

		// Refresh play/pause button, hide if 'delay' set to 0.
		pauseBackdrop(_onPause);
		
		if (!_bdw || !_bdc || !_bdi)
			return;
		
		switch(userSettings.enableBackdropWidget()) {
			case 0:
				_bdw.classList.add('hide');
				_bdc.classList.add('hide');
				_bdi.classList.add('hide');
				break;
			
			case 1:
				if (_item_url) 
					_bdi.href = _item_url;
				_bdi.classList.remove('hide');
				_bdc.classList.remove('hide');
				_bdw.classList.remove('hide');
				break;
				
			case 2:
				if (_item_url) 
					_bdi.href = _item_url;
				_bdc.classList.add('hide');
				_bdi.classList.remove('hide');
				_bdw.classList.remove('hide');
				break;
			
			case 3:
				_bdi.classList.add('hide');
				_bdc.classList.remove('hide');
				_bdw.classList.remove('hide');
				break;
		}
	}
	
	export function hideBackdropWidget() {
		const _bdw =  document.querySelector('#backdropWidget');
		const _bdc =  document.querySelector('#backdropControlButton');
		const _bdi =  document.querySelector('#backdropInfoButton');
		if (!_bdw || !_bdc || !_bdi)
			return;
		_bdw.classList.add('hide');
		_bdc.classList.add('hide');
		_bdi.classList.add('hide');
	}

    function onRotationInterval(x) {
        if (playbackManager.isPlayingLocally(['Video'])) {
            return;
        }

        let i = _currentRotationIndex + (x? x:1);
		if (i < 0)
			i = _currentRotatingImages.list.length - (-i % _currentRotatingImages.list.length);
		else
			i = i % _currentRotatingImages.list.length;
        _currentRotationIndex = i;
		setBackdropImage(_currentRotatingImages.list[i]);
		showBackdropWidget(_currentRotatingImages.details[i]);
    }

	export function showNextBackdrop() {
		onRotationInterval(+1);
    }
	
	export function showPrevBackdrop() {
		onRotationInterval(-1);
    }
	
	
	export function pauseBackdrop(x) {
		const _bpp = document.querySelector('#backdropPlayPauseButton');
		const _bpa = document.querySelector('#backdropRotationPause');
		const _bpl = document.querySelector('#backdropRotationPlay');
		const _bdc = document.querySelector('#backdropControlButton');
		if (!_bpa || !_bpl || !_bpp || !_bdc)
			return;
		
		const _delay = userSettings.backdropDelay();
		if (!_delay) {
			_bpp.classList.add('hide');
			_bdc.style.fontSize = '90%';
			return;
		} else {
			_bdc.style.fontSize = '70%';
			_bpp.classList.remove('hide');
		}
		
		if (x === undefined) {
			if (!_onPause) {
				toast(globalize.translate('RotationOnPause'));
				clearInterval(_rotationInterval);
				_rotationInterval = null;
				_bpa.classList.add('hide');
				_bpl.classList.remove('hide');
				_onPause = true;
			} else {
				toast(globalize.translate('RotationResume'));
				clearInterval(_rotationInterval);
				_rotationInterval = setInterval(onRotationInterval, _delay * 1000);
				onRotationInterval();
				_bpl.classList.add('hide');
				_bpa.classList.remove('hide');
				_onPause = false;
			}
		} else { 
			x = (x === true);
			_onPause = x;
			switch(x) {
				case true:
					_bpa.classList.add('hide');
					_bpl.classList.remove('hide');
					break;
				case false:
					_bpl.classList.add('hide');
					_bpa.classList.remove('hide');
					break;
			}
		}
    }
	
    function clearRotation() {
        if (_rotationInterval)
            clearInterval(_rotationInterval);
        _rotationInterval = null;
    }

    export function setBackdrop(url, imageOptions) {
        if (url && typeof url !== 'string') {
            const imgUrls = getImageUrls([url], imageOptions).list[0];
			url = imgUrls[0] || '#';
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
