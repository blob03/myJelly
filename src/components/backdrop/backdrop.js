import isEqual from 'lodash-es/isEqual';
import browser from '../../scripts/browser';
import { playbackManager } from '../playback/playbackmanager';
import dom from '../../scripts/dom';
import globalize from '../../scripts/globalize';
import * as userSettings from '../../scripts/settings/userSettings';
import ServerConnections from '../ServerConnections';
import { appRouter } from '../appRouter';
import toast from '../toast/toast';
import appSettings from '../../scripts/settings/appSettings';

import './backdrop.scss';

/* eslint-disable indent */

    function enableFastAnimation() {
		return userSettings.enableFastFadein() === true;
		
		//return !browser.slow;
	}

    function enableRotation() {
		//return !browser.tv
			// Causes high cpu usage
			//&& !browser.firefox;
		
		return true;
	}

	class Backdrop {
		constructor() {
		}
		
		load(src, parent, existingBackdropImage) {
			const self = this;
			const type = userSettings.enableBackdrops();
			if (!parent)
				return;
			switch(type) {
				case 'Theme':
					let backdropImage = document.createElement('div');
					let _classes = ['backdropImage', 'displayingBackdropImage', 'themeBackdrop'];

					if (!src || !src.theme) {
						const idx = Math.ceil(Math.random() * 4);
						if (idx)
							_classes.push('alt' + idx);
					} else
						_classes.push(src.theme);
					
					backdropImage.classList.add(..._classes);
					internalBackdrop(true);
					
					if (enableFastAnimation()) {
						if (existingBackdropImage)
							parent.removeChild(existingBackdropImage);
						backdropImage.classList.add('backdropImageFastFadeIn');
						parent.appendChild(backdropImage);
						return;
					}
					
					backdropImage.classList.add('backdropImageFadeIn');
					parent.appendChild(backdropImage);
					const onAnimationComplete = () => {
						dom.removeEventListener(backdropImage, dom.whichAnimationEvent(), onAnimationComplete, {
							once: true
						});
						if (backdropImage === self.currentAnimatingElement)
							self.currentAnimatingElement = null;
						if (existingBackdropImage)
							parent.removeChild(existingBackdropImage);
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
					if (!src || !src.url)
						return;
					const img = new Image();
					img.onload = () => {
						if (self.isDestroyed)
							return;

						let _classes = ['backdropImage', 'displayingBackdropImage'];
						let backdropImage = document.createElement('div');
						backdropImage.style.backgroundImage = `url('${src.url}')`;
						backdropImage.setAttribute('data-url', src.url);
						internalBackdrop(true);
						
						if (enableFastAnimation()) {
							if (existingBackdropImage)
								parent.removeChild(existingBackdropImage);
							_classes.push('backdropImageFastFadeIn');
							backdropImage.classList.add(..._classes);
							parent.appendChild(backdropImage);
							return;
						}

						_classes.push('backdropImageFadeIn');
						backdropImage.classList.add(..._classes);
						parent.appendChild(backdropImage);
						const onAnimationComplete = () => {
							dom.removeEventListener(backdropImage, dom.whichAnimationEvent(), onAnimationComplete, {
								once: true
							});
							if (backdropImage === self.currentAnimatingElement)
								self.currentAnimatingElement = null;
							if (existingBackdropImage)
								parent.removeChild(existingBackdropImage);
						};

						dom.addEventListener(backdropImage, dom.whichAnimationEvent(), onAnimationComplete, {
							once: true
						});
					};
					img.src = src.url;
					break;
				
				default:
				case 'none':
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
			case 'none':
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
		const elem = getBackdropContainer();
		const existingBackdropImage = elem.querySelector('.displayingBackdropImage');
		if (existingBackdropImage) { 
			if (existingBackdropImage.getAttribute('data-url') === url)
				return;
			existingBackdropImage.classList.remove('displayingBackdropImage');
		}
		if (_instance) {
			_instance.destroy();
			_instance = null;
		}
		_instance = new Backdrop();
		_instance.load({'url': url}, elem, existingBackdropImage);
    }
	
	export function setBackdropThemeImage(ref) {
		const elem = getBackdropContainer();
		// Check if ref isn't already in use in which case, we do nothing.
		const existingBackdropImage = elem.querySelector('.displayingBackdropImage');
		if (existingBackdropImage) {
			if (existingBackdropImage.classList.contains(ref))
				return;
			existingBackdropImage.classList.remove('displayingBackdropImage');
		}
		if (_instance) {
			_instance.destroy();
			_instance = null;
		}
		_instance = new Backdrop();
		_instance.load({'theme': ref}, elem, existingBackdropImage);
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
            const imgs = getItemImageUrls(items[i], imageOptions);
			if (imgs.length) {
				lot.list[i] = [];
				imgs.forEach( img => {
					lot.list[i].push(img) } );
			}
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
        if (!enabled())
			return;
		
		let images = {list: []};
		if (items) {
			images = getImageUrls(items, imageOptions);
			if (!images.list.length) {
				clearBackdrop();
				hideBackdropWidget();
				return;
			}
			if (images.list.length == 1) {
				setBackdropImage(images.list[0]);
				hideBackdropWidget();
				return;	
			}
		}

		startRotation(images, enableImageRotation);
	}

    function startRotation(images, enableImageRotation) {
		clearRotation();
		
		if (images && images.list.length) {
			if (enableImageRotation === false || !enableRotation()) {
				setBackdropImage(images.list[0]);
				hideBackdropWidget();
				return;
			}
			
			if (!isEqual(images.list, _currentRotatingImages.list)) {
				_currentRotatingImages = { ...images };
				_currentRotationIndex = 0;
			}
		}
		
		const _delay = userSettings.backdropDelay();
		if (_delay && !_onPause) {
			clearInterval(_rotationInterval);
			_rotationInterval = setInterval(onRotationInterval, _delay * 1000);
		}
		onRotationInterval(0);
		return;
	}
	
	var _onPause = false;
	export function showBackdropWidget(_item_url) {
		const _bdw =  document.querySelector('#backdropWidget');
		const _bdc =  document.querySelector('#backdropControlButton');
		const _bdi =  document.querySelector('#backdropInfoButton');
		const _bdco =  document.querySelector('#backdropContrast');
		
		// Refresh play/pause button, hide if 'delay' set to 0.
		pauseBackdrop(_onPause);
		
		if (!_bdw || !_bdc || !_bdi || !_bdco)
			return;
		
		const toolbox = userSettings.enableBackdropWidget();
		switch(toolbox) {
			case 0:
				_bdw.classList.add('hide');
				_bdc.classList.add('hide');
				_bdi.classList.add('hide');
				_bdco.classList.add('hide');
				break;
			
			case 7:
				_bdi.classList.remove('hide');
				_bdc.classList.remove('hide');
				_bdw.classList.remove('hide');
				_bdco.classList.remove('hide');
				break;
				
			default:
				if (toolbox & 1)
					_bdi.classList.remove('hide');
				else
					_bdi.classList.add('hide');
				if (toolbox & 2)
					_bdc.classList.remove('hide');
				else
					_bdc.classList.add('hide');
				if (toolbox & 4)
					_bdco.classList.remove('hide');
				else
					_bdco.classList.add('hide');
				
				if (toolbox)
					_bdw.classList.remove('hide');
				break;
		}
		if (_item_url)
			_bdi.href = _item_url;
		else
			_bdi.classList.add('hide');
		
		if (!_bdco.classList.contains('hide'))
			setBackdropContrast();
	}
	
	export function hideBackdropWidget() {
		const _bdw =  document.querySelector('#backdropWidget');
		const _bdc =  document.querySelector('#backdropControlButton');
		const _bdi =  document.querySelector('#backdropInfoButton');
		const _bdco =  document.querySelector('#backdropContrast');
		
		if (!_bdw || !_bdc || !_bdi || !_bdco)
			return;
		_bdw.classList.add('hide');
		_bdc.classList.add('hide');
		_bdi.classList.add('hide');
		_bdco.classList.add('hide');
	}

    function onRotationInterval(x) {
        if (playbackManager.isPlayingLocally(['Video'])) {
            return;
        }

        let i = _currentRotationIndex + (x !== undefined? x:1);
		
		switch(userSettings.enableBackdrops()) {
			case 'Theme':
				if (i < 0)
					i = 4 - (-i % 4);
				else
					i = i % 4;
				_currentRotationIndex = i;
				setBackdropThemeImage('alt' + ( i + 1));
				showBackdropWidget();
				break;
			
			default:
				if (i < 0)
					i = _currentRotatingImages.list.length - (-i % _currentRotatingImages.list.length);
				else
					i = i % _currentRotatingImages.list.length;
				_currentRotationIndex = i;
				setBackdropImage(_currentRotatingImages.list[i]);
				showBackdropWidget(_currentRotatingImages.details[i]);
		}
    }

	export function showNextBackdrop() {
		const _delay = userSettings.backdropDelay();
		if (_delay && !_onPause)
			clearInterval(_rotationInterval);
		onRotationInterval(+1);
		if (_delay && !_onPause)
			_rotationInterval = setInterval(onRotationInterval, _delay * 1000);
    }
	
	export function showPrevBackdrop() {
		const _delay = userSettings.backdropDelay();
		if (_delay && !_onPause)
			clearInterval(_rotationInterval);
		onRotationInterval(-1);
		if (_delay && !_onPause)
			_rotationInterval = setInterval(onRotationInterval, _delay * 1000);
    }
	
	export function setBackdropContrast(e) {
		let _val = e?.target?.value;
		if (!_val)
			_val = document.querySelector('#backdropContrastSlider').value;
		const _bc = document.querySelector('.backdropContainer');
		if (!_val || !_bc)
			return;
		_bc.style.opacity = parseFloat(_val/10);
		appSettings.set('opacity', _bc.style.opacity);
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
				onRotationInterval(+1);
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
    none: 'none'
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
