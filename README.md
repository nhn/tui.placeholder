# Placeholder
Generate virtual placeholders on the browser not supporting native 'placeholder' property

## Feature
* All 'input' and 'textarea' tags have 'placeholder' property display placeholder's value
* When select the 'input' or 'textarea' tag, placeholder's value don't disappear
* When insert content in the 'input' or 'textarea' tag, placeholder's value disappear
* When remove content in the 'input' or 'textarea' tag, placeholder's value appear

## Documentation
* **API** : [https://nhnent.github.io/tui.placeholder/latest](https://nhnent.github.io/tui.placeholder/latest)
* **Tutorial** : [https://github.com/nhnent/tui.placeholder/wiki](https://github.com/nhnent/tui.placeholder/wiki)
* **Example** :
[https://nhnent.github.io/tui.placeholder/latest/tutorial-example01-basic.html](https://nhnent.github.io/tui.placeholder/latest/tutorial-example01-basic.html)

## Dependency
* [tui-code-snippet](https://github.com/nhnent/tui.code-snippet) >=1.2.5

## Test Environment
### PC
* IE8~11
* Edge
* Chrome
* Firefox
* Safari

## Usage
### Use `npm`

Install the latest version using `npm` command:

```
$ npm install tui-placeholder --save
```

or want to install the each version:

```
$ npm install tui-placeholder@<version> --save
```

To access as module format in your code:

```javascript
var placeholder = require('tui-placeholder');

placeholder.generate();
```

### Use `bower`
Install the latest version using `bower` command:

```
$ bower install tui-placeholder
```

or want to install the each version:

```
$ bower install tui-placeholder#<tag>
```

To access as namespace format in your code:

```javascript
tui.placeholder.generate();
```

### Download
* [Download bundle files from `dist` folder](https://github.com/nhnent/tui.placeholder/tree/production/dist)
* [Download all sources for each version](https://github.com/nhnent/tui.placeholder/releases)

## License
[MIT LICENSE](https://github.com/nhnent/tui.placeholder/blob/master/LICENSE)
