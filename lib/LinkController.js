/*!
 * (c) 2019 Artur Doruch <arturdoruch@interia.pl>
 */

import eventRegistry from '@arturdoruch/event-registry';
import eventDispatcher from '@arturdoruch/event-dispatcher';

export default class LinkController {
    /**
     * @param {jQuery} $listContainer
     * @param {string} linkSelector
     */
    constructor($listContainer, linkSelector) {
        this._$listContainer = $listContainer;
        this._linkSelector = linkSelector;
    }

    attachEvent() {
        eventRegistry.on('click', this._$listContainer.find(this._linkSelector), function (e) {
            eventDispatcher.dispatch('arturdoruch_list.update', [e.target.href]);
        });
    }
}
