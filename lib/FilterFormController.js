/*!
 * (c) 2019 Artur Doruch <arturdoruch@interia.pl>
 */

import eventDispatcher from '@arturdoruch/event-dispatcher';
import Form from '@arturdoruch/form';
import typeChecker from '@arturdoruch/util/lib/type-checker';
import urlUtils from '@arturdoruch/util/lib/url-utils';

let defaultOptions = {
    filterButtonSelector: 'button[type="submit"]',
    resetButtonSelector: 'button[type="reset"]',
    resetData: {},
    noResetFields: [],
    filterAfterReset: true,
    resetSorting: true
};

let queryParameterNames;

/**
 * Controller of the form filtering the item list.
 */
export default class FilterFormController {
    /**
     * @param {string|HTMLFormElement|jQuery} formSelector The form HTMLFormElement or jQuery object, or CSS selector.
     * @param {{}}      [options]
     * @param {string}  [options.filterButtonSelector = button[type="submit"]]
     * @param {string}  [options.resetButtonSelector = button[type="reset"]]
     * @param {{}}      [options.resetData] The values of the form elements to set while resetting the form.
     * @param {[]}      [options.noResetFields] The names of form elements which values should not be reset when reset button is clicked.
     * @param {boolean} [options.filterAfterReset = true] Whether to filter list items after resetting the form.
     * @param {boolean} [options.resetSorting] Whether to reset item list sorting, while filtering.
     *                                         To omit this setting, in HTML code embed the following input element:
     *                                         <input type="hidden" name="list__filter-form__reset-sorting[{filter form name}]" value="{0 or 1}">
     */
    constructor(formSelector, options) {
        if (!formSelector) {
            throw new TypeError('FilterFormController: Missing "formSelector" argument.');
        }

        this._form = new Form(formSelector);
        this._options = Object.assign({}, defaultOptions, options);
        this._currentUrlQuery = null;
        this._resetSorting = getInputValue('list__filter-form__reset-sorting['+this._form.getName()+']', this._options.resetSorting) == 1;
        validateQueryParameterNames();

        for (const name in queryParameterNames) {
            this._form.removeElement(queryParameterNames[name]);
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
     * @param {string} url URL of the last requested endpoint getting list items.
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
        delete queryParameters[queryParameterNames.page];

        if (this._resetSorting) {
            delete queryParameters[queryParameterNames.sort];
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


(function () {
    const inputSelector = '<input name="list__query-parameter-names">';
    let names = getInputValue('list__query-parameter-names', null);

    if (!names) {
        return;
    }

    let _names = JSON.parse(names);

    if (!typeChecker.isObject(_names)) {
        throw new TypeError(`Invalid value of the "${inputSelector}" element. Expected JSON string, but got "${names}".`);
    }

    try {
        setQueryParameterNames(_names);
    } catch (error) {
        throw new TypeError(`Invalid value of the "${inputSelector}" element. ` + error.message);
    }
})();

/**
 * Sets request query parameter names used by backend system for setting: page number, sorting and items list limit.
 * These parameter names are required for removing these parameters form the request query (when are not required),
 * while filtering the list.
 *
 * To omit calling this method, in HTML code embed the input element, with value as encoded JSON with query parameter names.
 *
 * <input type="hidden" name="list__query-parameter-names" value="{page: "page value", sort: "sort value", limit: "limit value"}">
 *
 * @param {string|object} page A string with "page" query parameter name or object with all parameter names.
 * @param {string} [sort] The "sort" query parameter name. Is required when "page" argument is a string.
 * @param {string} [limit] The "limit" query parameter name. Is required when "page" argument is a string.
 */
export function setQueryParameterNames(page, sort, limit) {
    if (queryParameterNames) {
        throw new Error('The query parameter names are already set.');
    }

    const names = typeChecker.isObject(page) ? page : {page, sort, limit};

    for (let name of ['page', 'sort', 'limit']) {
        if (!names.hasOwnProperty(name)) {
            throw new TypeError(`Missing object "${name}" property.`);
        }
    }

    queryParameterNames = names;
}

function validateQueryParameterNames() {
    if (!queryParameterNames) {
        throw new Error(`Query parameter names are not set.`);
    }
}


function getInputValue(name, defaultValue) {
    const input = document.querySelector('input[name="'+name+'"]');

    return input ? input.value : defaultValue;
}