/*!
 * (c) 2019 Artur Doruch <arturdoruch@interia.pl>
 */

import $ from 'jquery';
import eventDispatcher from '@arturdoruch/event-dispatcher';
import ajax from '@arturdoruch/helper/lib/ajax';
import FilterFormController from './FilterFormController';
import FormController from './FormController';
import LinkController from './LinkController';

let defaultOptions = {
    gettingItemsMessage: null,
    gettingItemsLoader: true,
    paginationListSelector: 'ul.ad-list__pagination',
    sortLinkSelector: 'a.ad-list__sort-link',
    limitFormSelector: 'form[name="ad-list__limit"]',
    sortFormSelector: 'form[name="ad-list__sort"]',
    addHistoryState: true
};

/**
 * Handles item list actions: pagination, sorting, changing item limits, filtering.
 */
export default class ListController {
    /**
     * @param {HTMLElement|jQuery|string} listContainer HTML element, jQuery object of CSS selector of the element holding the list items.
     * @param {FilterFormController} [filterFormController]
     * @param {object}  [options] Options for updating list items.
     * @param {string}  [options.gettingItemsMessage = null] Text message to display while getting list items.
     * @param {bool}    [options.gettingItemsLoader = true] Whether the image loader should be displayed while getting list items.
     * @param {string}  [options.paginationListSelector]
     * @param {string}  [options.limitFormSelector]
     * @param {string}  [options.sortLinkSelector]
     * @param {string}  [options.sortFormSelector]
     * @param {boolean} [options.addHistoryState = true] Whether to add list state to the browser session history stack, after ajax request.
     *                                                   Set false when the item list is loaded as modal content, and browser url should not be changed.
     */
    constructor(listContainer, filterFormController, options) {
        if (!listContainer) {
            throw new TypeError('Missing "listContainer" argument.');
        }

        let $listContainer = this._$listContainer = $(listContainer);

        if ($listContainer.length === 0) {
            let errorMessage = 'Invalid "listContainer" argument.';

            if (typeof listContainer === 'string') {
                errorMessage += ` HTML element with selector "${listContainer}" does not exist.`;
            }

            throw new TypeError(errorMessage);
        }

        this._options = Object.assign({}, defaultOptions, options);
        this._updateListeners = [];
        this._updateFailureListeners = [];

        this._limitFormController = new FormController($listContainer, this._options.limitFormSelector);
        this._sortFormController = new FormController($listContainer, this._options.sortFormSelector);
        this._paginationLinkController = new LinkController($listContainer, this._options.paginationListSelector + ' a');
        this._sortLinkController = new LinkController($listContainer, this._options.sortLinkSelector);
        this._filterFormController = filterFormController;

        this._attachListeners();
        this._attachEvents();
        let self = this;

        window.onpopstate = function(e) {
            self._updateList(e.state, window.location.href);
        };
    }

    /**
     * Registers listener called after updating the list.
     *
     * @param {function} listener The listener function. Function receives argument: $listContainer.
     */
    addUpdateListener(listener) {
        if (typeof listener !== 'function') {
            throw new TypeError('The update list listener is not a function.');
        }

        this._updateListeners.push(listener);
    }

    /**
     * Registers listener called when updating the list failed.
     *
     * @param {function} listener The listener function. Function receives arguments: response, requestUrl
     */
    addUpdateFailureListener(listener) {
        if (typeof listener !== 'function') {
            throw new TypeError('The update list failure listener is not a function.');
        }

        this._updateFailureListeners.push(listener);
    }

    /**
     * @private
     */
    _attachListeners() {
        const self = this;

        eventDispatcher.addListener('arturdoruch_list.update', function(url) {
            self._getAndUpdateList(url);
        });
    }

    /**
     * @private
     */
    _attachEvents() {
        this._paginationLinkController.attachEvent();
        this._sortLinkController.attachEvent();
        this._limitFormController.attachEvent();
        this._sortFormController.attachEvent();
    }

    /**
     * Loads list content. Makes ajax request and update list items.
     *
     * @param {string} url Url to the web server controller action getting list items.
     * @private
     */
    _getAndUpdateList(url) {
        const self = this;

        ajax.send(url, this._options.gettingItemsMessage, this._options.gettingItemsLoader)
            .done(function(html) {
                if (self._options.addHistoryState === true) {
                    addHistoryState(url, html);
                } else if (self._filterFormController) {
                    self._filterFormController.setCurrentUrlQuery(url);
                }

                self._updateList(html);
            })
            .fail(function (xhr) {
                const response = {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    text: xhr.responseText,
                    json: xhr.responseJSON,
                };

                self._dispatchUpdateFailureEvent(url, response);
            });
    }

    /**
     * @private
     */
    _updateList(html) {
        this._$listContainer.html(html);
        this._attachEvents();
        // Dispatch update table event
        for (const listener of this._updateListeners) {
            listener.call(null, this._$listContainer);
        }
    }

    /**
     * @private
     */
    _dispatchUpdateFailureEvent(requestUrl, response) {
        //console.log(response.status + ' ' + response.statusText);

        for (const listener of this._updateFailureListeners) {
            listener.call(null, response, requestUrl);
        }
    }
}

function addHistoryState(url, html) {
    try {
        history.pushState(html, '', url);
    } catch (error) {
        console.log('An error occurred while pushing data to the browser session history.');
        console.log(error);
    }
}
