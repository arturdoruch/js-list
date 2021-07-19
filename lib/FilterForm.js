/*!
 * (c) Artur Doruch <arturdoruch@interia.pl>
 */

import eventDispatcher from '@arturdoruch/event-dispatcher';
import Form from '@arturdoruch/form';
import typeChecker from '@arturdoruch/util/lib/type-checker.js';
import urlUtils from '@arturdoruch/util/lib/url-utils.js';

let defaultOptions = {
    submitButtonSelector: null,
    resetButtonSelector: 'button[type="reset"]',
    resetData: {},
    noResetElements: [],
    submitAfterReset: true,
    resetSorting: true
};

let queryParameterNames;

/**
 * Controller of the form filtering the item list.
 */
export default class FilterForm extends Form {
    /**
     * @param {string|HTMLFormElement|jQuery} formSelector The form HTMLFormElement or jQuery object, or CSS selector.
     * @param {{}}      [options]
     * @param {string}  [options.submitButtonSelector = button[type="submit"]]
     * @param {string}  [options.resetButtonSelector = button[type="reset"]]
     * @param {{}}      [options.resetData] The values of the form elements to set while resetting the form.
     * @param {[]}      [options.noResetElements] The names of form elements which values should not be reset when reset button is clicked.
     * @param {boolean} [options.submitAfterReset = true] Whether to filter list items after resetting the form.
     * @param {boolean} [options.resetSorting] Whether to reset item list sorting, while filtering.
     *                                         To omit this setting, in HTML code embed the following input element:
     *                                         <input type="hidden" name="list__filter-form__reset-sorting[{filter form name}]" value="{0 or 1}">
     */
    constructor(formSelector, options) {
        super(formSelector);

        this._options = Object.assign({}, defaultOptions, options);
        this._currentUrlQuery = null;
        this._resetSorting = getInputValue('list__filter-form__reset-sorting['+this.getName()+']', this._options.resetSorting) == 1;
        const queryParameterNames = getQueryParameterNames();

        for (const name in queryParameterNames) {
            this.removeElement(queryParameterNames[name]);
        }

        const listenerOptions = { context: this };

        this
            .addElementListener('change', 'select:not([multiple="multiple"])', this._submit, listenerOptions)
            .addElementListener('change', 'input[type="radio"]', this._submit, listenerOptions)
            .addElementListener('click', this._options.resetButtonSelector, this._reset, listenerOptions)
            .addSubmitListener(this._submit, listenerOptions);

        if (this._options.submitButtonSelector) {
            this.addElementListener('click', this._options.submitButtonSelector, this._submit, listenerOptions)
        }
    }

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
    static setQueryParameterNames(page, sort, limit) {
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

    /**
     * @param {string} url URL of the last requested endpoint getting list items.
     */
    setCurrentUrlQuery(url) {
        this._currentUrlQuery = urlUtils.parseUrl(url).search;
    }

    /**
     * @private
     */
    _reset() {
        this.resetData(this._options.noResetElements, false);
        this.setData(this._options.resetData, false);

        if (this._options.submitAfterReset === true) {
            this._submit();
        }
    }

    /**
     * @private
     */
    _submit() {
        let queryParameters = urlUtils.parseQueryString(this._currentUrlQuery || location.search);

        delete queryParameters[this.getName()];
        delete queryParameters[queryParameterNames.page];

        if (this._resetSorting) {
            delete queryParameters[queryParameterNames.sort];
        }

        const request = this.createHttpRequest(true, queryParameters);

        eventDispatcher.dispatch('arturdoruch_list.update', [request.getUrl()]);
    }

    /**
     * @private
     */
    submit() {
        throw new Error('Calling the "submit()" method is not allowed.');
    }
}

/**
 * @return {{}}
 */
function getQueryParameterNames() {
    if (!queryParameterNames) {
        const inputSelector = '<input name="list__query-parameter-names">';
        let names = getInputValue('list__query-parameter-names', null);

        if (!names) {
            throw new Error(`The query parameter names are not set.`);
        }

        let _names = JSON.parse(names);

        if (!typeChecker.isObject(_names)) {
            throw new TypeError(`Invalid value of the "${inputSelector}" element. Expected JSON string, but got "${names}".`);
        }

        try {
            FilterForm.setQueryParameterNames(_names);
        } catch (error) {
            throw new TypeError(`Invalid value of the "${inputSelector}" element. ` + error.message);
        }
    }

    return queryParameterNames;
}

function getInputValue(name, defaultValue) {
    const input = document.querySelector('input[name="'+name+'"]');

    return input ? input.value : defaultValue;
}
