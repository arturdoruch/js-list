/*!
 * (c) 2019 Artur Doruch <arturdoruch@interia.pl>
 */

import eventDispatcher from '@arturdoruch/event-dispatcher';
import urlUtils from '@arturdoruch/util/lib/url-utils';
import Form from '@arturdoruch/form';

let defaultOptions = {
    filterButtonSelector: 'button[type="submit"]',
    resetButtonSelector: 'button[type="reset"]',
    resetData: {},
    noResetFields: [],
    filterAfterReset: true
};

export default class FilterFormController {
    /**
     * @param {string} formSelector The form HTMLFormElement or jQuery object, or CSS selector.
     * @param {{}}      [options]
     * @param {string}  [options.filterButtonSelector = button[type="submit"]]
     * @param {string}  [options.resetButtonSelector = button[type="reset"]]
     * @param {{}}      [options.resetData] The values of the form elements to set while reseting the form.
     * @param {[]}      [options.noResetFields] The names of form elements which values should not be reset when reset button is clicked.
     * @param {boolean} [options.filterAfterReset = true] Whether to filter list items after reseting the form.
     */
    constructor(formSelector, options) {
        if (!formSelector) {
            throw new TypeError('FilterFormController: Missing "formSelector" argument.');
        }

        this._form = new Form(formSelector);
        this._options = Object.assign({}, defaultOptions, options);
        this._currentUrlQuery = null;
        // Gets queryParameterNames and resetSorting from input elements.
        this._queryParameterNames = JSON.parse(getInputValue('list__query-parameter-names', {}));
        this._resetSorting = getInputValue('list__filter-form__reset-sorting['+this._form.getName()+']', 0) == 1;

        for (const name in this._queryParameterNames) {
            this._form.removeElement(this._queryParameterNames[name]);
        }

        const listenerOptions = { context: this };

        this._form
            .addElementListener('change', 'select:not([multiple="multiple"])', this._filter, listenerOptions)
            .addElementListener('change', 'input[type="radio"]', this._filter, listenerOptions)
            .addElementListener('click', this._options.filterButtonSelector, this._filter, listenerOptions)
            .addElementListener('click', this._options.resetButtonSelector, this._reset, listenerOptions)
            .addSubmitListener(this._filter, listenerOptions);
    }

    /*
     * Registers form element event listener.
     *
     * @param {string} event The event name.
     * @param {string} name The form element name or CSS selector.
     * @param {function} listener
     * @param {{}}      [options]
     * @param {[]}      [options.arguments] The listener arguments.
     * @param {{}}      [options.context = window] The listener context.
     * @param {boolean} [options.preventDefault = true]
     */
    /*addFormElementListener(event, name, listener, options = {}) {
        this._form.addElementListener(event, name, listener, options);
    }*/

    /**
     * @param {string} url The url of the last requested endpoint getting list items.
     */
    setCurrentUrlQuery(url) {
        this._currentUrlQuery = urlUtils.parseUrl(url).search;
    }

    /**
     * @private
     */
    _filter() {
        let queryParameters = urlUtils.parseQueryString(this._currentUrlQuery || location.search);

        delete queryParameters[this._form.getName()];
        delete queryParameters[this._queryParameterNames.page];

        if (this._resetSorting) {
            delete queryParameters[this._queryParameterNames.sort];
        }

        const url = this._form.createRequestUrl(true, queryParameters);

        eventDispatcher.dispatch('arturdoruch_list.update', [url]);
    }

    /**
     * @private
     */
    _reset() {
        this._form.resetData(this._options.noResetFields, false);
        this._form.setData(this._options.resetData);

        if (this._options.filterAfterReset === true) {
            this._filter();
        }
    }
}

function getInputValue(name, defaultValue) {
    const input = document.querySelector('input[name="'+name+'"]');

    return input ? input.value : defaultValue;
}
