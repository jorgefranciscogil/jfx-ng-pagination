# jfx-ng-pagination

## Getting Started

``` javascript
// Add the jfx-ng-pagination module as a dependency to your application module:
var app = angular.module('yourApp', ['jfx-ng-pagination'])
```

## Code Samples

The following attributes explored in the basic example are required directive inputs:

- `limit` How many items in the list to display on a page.
- `records` What is the total count of items in my list.

**Basic Example**

```html
<jfx-ng-pagination
  current-page="1" 
  limit="10" 
  records="500"
  on-page-changed="foo('bar', page)">
</jfx-ng-pagination>
```

- `current-page` What page am I currently viewing.
- `on-page-changed` The action that will be executed when the page changes.