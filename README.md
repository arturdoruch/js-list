# List

JavaScript support for pagination, sorting and filtering list items.

## Installation

```
yarn add https://github.com/arturdoruch/js-list#^0.1
```

## Usage

Setup `ListController` and `FilterFormController` for specific list. 

```js
import '@arturdoruch/list/styles/list.css';
import ListController from '@arturdoruch/list/lib/ListController';
import FilterFormController from '@arturdoruch/list/lib/FilterFormController';

// Optionally set FilterFormController for the form filtering the list items.
const filterFormController = new FilterFormController('form[name="filter"]', {
    // Options
});

const listController = new ListController('#list-container', filterFormController, {
    // Options
});

// Register listener called after updating the list.
listController.addUpdateListListener(function ($listContainer) {
    // For example: Attach events to the list items. 
});
```

For displaying notice message and loader while getting list items set ProcessNoticer.
[See description](https://github.com/arturdoruch/js-helper#ajax-setting-process-noticer).