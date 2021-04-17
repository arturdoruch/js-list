# List

JavaScript support for pagination, sorting and filtering of list items.

## Installation

```
yarn add https://github.com/arturdoruch/js-list#^0.1
```

## Usage

Import CSS styles for styling filter form and item list.
```js
import '@arturdoruch/list/styles/list.css';
```

Setup `ListController` and `FilterForm` for a specific list. 

```js
import ListController from '@arturdoruch/list/lib/ListController';
import FilterForm from '@arturdoruch/list/lib/FilterForm';

// Create (optionally) FilterForm managing the form filtering the list items.
const filterForm = new FilterForm('form[name="filter"]', options);

const listController = new ListController('#list-container', filterForm, options);

// Register listener called after updating the list.
listController.addUpdateListener(function ($listContainer) {
    // For example: Attach events to the list items. 
});
```

For displaying notice message and loader while getting list items set ProcessNoticer.
[See description](https://github.com/arturdoruch/js-helper#ajax-setting-process-noticer).

See files [ListController.js](lib/ListController.js) and [FilterForm.js](lib/FilterForm.js)
for details of available methods and arguments.

### FilterForm

The `FilterForm` class controls the form filtering the list items. 
Set if the item list, has a filter form.

```js
import FilterForm from '@arturdoruch/list/lib/FilterForm';

const filterForm = new FilterForm(formSelector, options);
```

#### Constructor arguments
    
  * `formSelector` *string|HTMLFormElement|jQuery* HTMLFormElement or jQuery object, or CSS selector to the filter form.
  * `options` *object*    
     * `filterButtonSelector` *string (default: `button[type="submit"]`)* CSS selector to the button sending the form.
     * `resetButtonSelector` *string (default: `button[type="reset"]`)* CSS selector to the button resetting form elements.
     * `resetData` *object* The values of the form elements to set while resetting the form.
     * `noResetFields` *array* The names of form elements which values should not be reset, when reset button is clicked.
     * `filterAfterReset` *boolean (default: `true`)* Whether to filter list items after resetting the form.
     * `resetSorting` *boolean* Whether to reset item list sorting, while filtering.
       To omit this setting, in HTML code embed the following input element:
       ```html
       <input type="hidden" name="list__filter-form__reset-sorting[{filter form name}]" value="{0 or 1}">
       ```

#### Setting query parameter names
        
Your backend system uses some GET request query parameters for setting: page number, sorting and items list limit.
The names of these parameter are necessary to be know in JavaScript code, in order to removing these parameters
form the request query (when are not required), while filtering the list.

To achieve this, in HTML code embed the input element, with value as encoded JSON with query parameter names

```html
<input type="hidden" name="list__query-parameter-names" value="{page: \"page value\", sort: \"sort value\", limit: \"limit value\"}">
```        
  
or call global static method `FilterForm.setQueryParameterNames()` with arguments:
        
 * `page` *string|object* A string with "page" query parameter name or object with all parameter names.
 * `sort` *string* The "sort" query parameter name. Is required when "page" argument is a string.
 * `limit` *string* The "limit" query parameter name. Is required when "page" argument is a string.
            
Example:                  
```js
import FilterForm from '@arturdoruch/list/lib/FilterForm';

FilterForm.setQueryParameterNames('page', 'sort', 'limit');
```
        
<!--
### ListController API

 * `constructor`
    <br>**Arguments**
 
    * `listContainer` HTMLElement|jQuery|string **required**
       <br>HTML element, jQuery object of CSS selector of the element holding the list items.
       
    * `filterForm` FilterForm
    
    * `options` object
       <br>Options for updating list items.
        * `gettingItemsMessage` string (default: null)
         <br>Text message to display while getting list items.
         
        * `gettingItemsLoader` boolean (default: true)
         <br>Whether the image loader should be displayed while getting list items.
         
        * `paginationListSelector` string (default: `ul.ad-list__pagination`)
         <br>CSS selector of the pagination element.
         
        * `limitFormSelector` string (default: `form[name="ad-list__limit"]`)
         <br>CSS selector of the element (usually "select" element) changing the limit of  displayed list items per page.
        
        * `sortLinkSelector` string (default: `a.ad-list__sort-link`)
         <br>CSS selector of the element sorting the list (usually "a" element in table head cell).
        
        * `sortFormSelector` string (default: `form[name="ad-list__sort"]`)
         <br>CSS selector of the element sorting the list (usually "select" element with defined sorting options).
         
        * `addHistoryState` boolean (default: true) 
         <br>Whether to add list state to the browser session history stack, after ajax request.
         Set false when the item list is loaded as modal content, and browser url should not be changed.
         
 * `addUpdateListener`
  <br>Registers listener called after updating the list. Allows to register events to the updated list items. 
  <br>**Arguments**
    * `listener` function **required**
    <br>Function receives argument "$listContainer".
         
 * `addUpdateFailureListener`
   <br>Registers listener called when updating the list failed. 
   <br>**Arguments**
   * `listener` function **required**
   <br>Function receives arguments: "response", "requestUrl".
   
### FilterForm API   


## Examples of item list and filter form HTML markup

Filter form

```html
<div class="filter-form-container">
    <form name="filter" method="get" action="" novalidate="novalidate">
        <div class="filter-form-fields">   
            <label class="control-label" for="filter_category">Category</label>
            <select id="filter_category" name="filter[category]" class="form-control">
                <option value="">-- all --</option>
                <option value="category1">category1</option>
                <option value="category2">category2</option>
            </select>
            
            <label class="control-label" for="filter_title">Title</label>
            <input type="text" id="filter_title" name="filter[title]" class="form-control">  
        </div>
        <div class="filter-form-buttons text-right">
            <button type="reset" class="btn btn-default"><span class="glyphicon glyphicon-remove"></span> Reset</button>
            <button type="submit" class="btn btn-success"><span class="glyphicon glyphicon-search"></span> Filter</button>
        </div>                         
    </form>
</div>
```
-->