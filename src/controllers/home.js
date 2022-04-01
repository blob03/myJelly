import TabbedView from '../components/tabbedview/tabbedview';
import globalize from '../scripts/globalize';
import '../elements/emby-tabs/emby-tabs';
import '../elements/emby-button/emby-button';
import '../elements/emby-scroller/emby-scroller';
import LibraryMenu from '../scripts/libraryMenu';

class HomeView extends TabbedView {
    constructor(view, params) {
        super(view, params);
    }

    setTitle() {
        LibraryMenu.setTitle(null);
    }

    onPause() {
        super.onPause(this);
        document.querySelector('.skinHeader').classList.remove('noHomeButtonHeader');
    }

    onResume(options) {
        super.onResume(this, options);
        document.querySelector('.skinHeader').classList.add('noHomeButtonHeader');
    }

    getDefaultTabIndex() {
        return 0;
    }

    getTabs() {
        return [{
            /*name: globalize.translate('Home');*/
			name: '<span class="material-icons home" title="' + globalize.translate('Home') + '" style="color: #c1dede;font-size: 1.5rem;"></span>'
        }, {
            /*name: globalize.translate('Favorites')*/
			name: '<span class="material-icons favorite" title="' + globalize.translate('Favorites') + '" style="color: #c1dede;font-size: 1.5rem;"></span>'
        }, {
			/*name: globalize.translate('About')*/
			name: '<span class="material-icons info" title="' + globalize.translate('About') + '" style="color: #c1dede;font-size: 1.5rem;"></span>'
		}];
    }

    getTabController(index) {
        if (index == null) {
            throw new Error('index cannot be null');
        }

        let depends = '';

        switch (index) {
            case 0:
                depends = 'hometab';
                break;

            case 1:
                depends = 'favorites';
				break;
				
			case 2:
                depends = 'about';
                break;
        }

        const instance = this;
        return import(/* webpackChunkName: "[request]" */ `../controllers/${depends}`).then(({ default: controllerFactory }) => {
            let controller = instance.tabControllers[index];

            if (!controller) {
                controller = new controllerFactory(instance.view.querySelector(".tabContent[data-index='" + index + "']"), instance.params);
                instance.tabControllers[index] = controller;
            }

            return controller;
        });
    }
}

export default HomeView;
