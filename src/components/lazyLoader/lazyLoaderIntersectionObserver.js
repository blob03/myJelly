/* eslint-disable indent */
    export class LazyLoader {
        constructor(options) {
            this.options = options;
        }

        createObserver() {
            const callback = this.options.callback;

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        callback(entry);
                    });
                },
                {rootMargin: '25%'});

            this.observer = observer;
        }

        addElements(elements) {
            let observer = this.observer;

            if (!observer) {
                this.createObserver();
                observer = this.observer;
            }

            Array.from(elements).forEach(element => {
                observer.observe(element);
            });
        }

        destroyObserver() {
            const observer = this.observer;

            if (observer) {
                observer.disconnect();
                this.observer = null;
            }
        }

        destroy() {
            this.destroyObserver();
            this.options = null;
        }
    }

    function unveilElements(elements, root, callback) {
        if (!elements.length) {
            return;
        }
        const lazyLoader = new LazyLoader({
            callback: callback
        });
        lazyLoader.addElements(elements);
    }

    export function lazyChildren(elem, callback) {
        unveilElements(elem.getElementsByClassName('lazy'), elem, callback);
    }

/* eslint-enable indent */
export default {
    LazyLoader: LazyLoader,
    lazyChildren: lazyChildren
};
