/*!
 * (c) Artur Doruch <arturdoruch@interia.pl>
 */

import eventRegistry from '@arturdoruch/event-registry';
import eventDispatcher from '@arturdoruch/event-dispatcher';
import Form from '@arturdoruch/form';

export default class FormController {
    /**
     * @param {jQuery} $listContainer
     * @param {string} formSelector
     */
    constructor($listContainer, formSelector) {
        this._$listContainer = $listContainer;
        this._formSelector = formSelector;
    }

    attachEvent() {
        const $form = this._$listContainer.find(this._formSelector);

        if ($form.length === 0) {
            return;
        }

        const form = new Form($form[0]);
        $form.find('select').removeAttr('onchange');

        eventRegistry.on('change', $form, function () {
            eventDispatcher.dispatch('arturdoruch_list.update', [form.createHttpRequest().getUrl()]);
        });
    }
}
