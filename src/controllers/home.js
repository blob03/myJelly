import TabbedView from '../components/tabbedview/tabbedview';
import globalize from '../scripts/globalize';
import '../elements/emby-tabs/emby-tabs';
import '../elements/emby-button/emby-button';
import '../elements/emby-scroller/emby-scroller';
import LibraryMenu from '../scripts/libraryMenu';

class HomeView extends TabbedView {
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
			name: '<span class="material-icons home skinHeader-withBackground" title="' + globalize.translate('Home') + '" style="box-shadow: 0 0 0 0 rgba(0,0,0,0) !important;background: rgba(0,0,0,0) !important;font-size: 1.5rem;"></span>'
        }, {
            name: '<span class="material-icons favorite skinHeader-withBackground" title="' + globalize.translate('Favorites') + '" style="box-shadow: 0 0 0 0 rgba(0,0,0,0) !important;background: rgba(0,0,0,0) !important;font-size: 1.5rem;"></span>'
        }, {
			name: '<span class="material-icons info skinHeader-withBackground" title="' + globalize.translate('About') + '" style="box-shadow: 0 0 0 0 rgba(0,0,0,0) !important;background: rgba(0,0,0,0) !important;font-size: 1.5rem;"></span>'
		}];
    }

    getTabController(index) {
        if (index == null || isNaN(index)) {
            throw new Error('index must be a number');
        }

        let depends = 'hometab';

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
