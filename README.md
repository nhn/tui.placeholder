# TOAST UI Component : Placeholder
> Component that creates a virtual placeholder when the browser native placeholder is not provided.

[![GitHub release](https://img.shields.io/github/release/nhnent/tui.placeholder.svg)](https://github.com/nhnent/tui.placeholder/releases/latest)
[![npm](https://img.shields.io/npm/v/tui-placeholder.svg)](https://www.npmjs.com/package/tui-placeholder)
[![GitHub license](https://img.shields.io/github/license/nhnent/tui.placeholder.svg)](https://github.com/nhnent/tui.placeholder/blob/production/LICENSE)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-ff69b4.svg)](https://github.com/nhnent/tui.project-name/labels/help%20wanted)
[![code with hearth by NHN Entertainment](https://img.shields.io/badge/%3C%2F%3E%20with%20%E2%99%A5%20by-NHN%20Entertainment-ff1414.svg)](https://github.com/nhnent)


## 🚩 Table of Contents
* [Browser Support](#-browser-support)
* [Features](#-features)
* [Examples](#-examples)
* [Install](#-install)
    * [Via Package Manager](#via-package-manager)
    * [Via Contents Delivery Network (CDN)](#via-contents-delivery-network-cdn)
    * [Download Source Files](#download-source-files)
* [Usage](#-usage)
    * [HTML](#html)
    * [JavaScript](#javascript)
* [Pull Request Steps](#-pull-request-steps)
    * [Setup](#setup)
    * [Develop](#develop)
    * [Pull Request Steps](#pull-request)
* [Documents](#-documents)
* [Contributing](#-contributing)
* [Dependency](#-dependency)
* [License](#-license)


## 🌏 Browser Support
| <img src="https://user-images.githubusercontent.com/1215767/34348387-a2e64588-ea4d-11e7-8267-a43365103afe.png" alt="Chrome" width="16px" height="16px" /> Chrome | <img src="https://user-images.githubusercontent.com/1215767/34348590-250b3ca2-ea4f-11e7-9efb-da953359321f.png" alt="IE" width="16px" height="16px" /> Internet Explorer | <img src="https://user-images.githubusercontent.com/1215767/34348380-93e77ae8-ea4d-11e7-8696-9a989ddbbbf5.png" alt="Edge" width="16px" height="16px" /> Edge | <img src="https://user-images.githubusercontent.com/1215767/34348394-a981f892-ea4d-11e7-9156-d128d58386b9.png" alt="Safari" width="16px" height="16px" /> Safari | <img src="https://user-images.githubusercontent.com/1215767/34348383-9e7ed492-ea4d-11e7-910c-03b39d52f496.png" alt="Firefox" width="16px" height="16px" /> Firefox |
| :---------: | :---------: | :---------: | :---------: | :---------: |
| Yes | 8+ | Yes | Yes | Yes |


## 🎨 Features
* Creates on elements of every input type including `textarea`.
* Adds on elements an user's class name for customizing.
* Keeps the placeholder when the `input` element is focused elements in IE10+ browsers.


## 🐾 Examples
* [Basic](https://nhnent.github.io/tui.placeholder/latest/tutorial-example01-basic.html): Example of using default options.
* [Dynamic creation](https://nhnent.github.io/tui.placeholder/latest/tutorial-example03-dynamic-creation.html) : Example of handling placeholders for dynamically added or deleted elements.

More examples can be found on the left sidebar of each example page, and have fun with it.


## 💾 Install

TOAST UI products can be used by using the package manager or downloading the source directly.
However, we highly recommend using the package manager.

### Via Package Manager

TOAST UI products are registered in two package managers, [npm](https://www.npmjs.com/) and [bower](https://bower.io/).
You can conveniently install it using the commands provided by each package manager.
When using npm, be sure to use it in the environment [Node.js](https://nodejs.org/ko/) is installed.

#### npm

``` sh
$ npm install --save tui-placeholder # Latest version
$ npm install --save tui-placeholder@<version> # Specific version
```

#### bower

``` sh
$ bower install tui-placeholder # Latest version
$ bower install tui-placeholder#<tag> # Specific version
```

### Via Contents Delivery Network (CDN)
TOAST UI products are available over the CDN powered by [TOAST Cloud](https://www.toast.com).

You can use the CDN as below.

```html
<script src="https://uicdn.toast.com/tui.placeholder/latest/tui-placeholder.js"></script>
```

If you want to use a specific version, use the tag name instead of `latest` in the url's path.

The CDN directory has the following structure.

```
tui.placeholder/
├─ latest/
│  ├─ tui-placeholder.js
│  └─ tui-placeholder.min.js
├─ v2.1.0/
│  ├─ ...
```

### Download Source Files
* [Download bundle files](https://github.com/nhnent/tui.placeholder/tree/production/dist)
* [Download all sources for each version](https://github.com/nhnent/tui.placeholder/releases)


## 🔨 Usage

### HTML

This component requires a target elements.

``` html
<input type="text" placeholder="Enter your name" />
<input type="number" placeholder="Enter your phone number" />
```

### JavaScript

This component does not use the instance created through the constructor function.
First, you should import the module using one of the following ways depending on your environment.

#### Using namespace in browser environment
``` javascript
var placeholder = tui.placeholder;
```

#### Using module format in node environment
``` javascript
var placeholder = require('tui-placeholder'); /* CommonJS */
```

``` javascript
import {placeholder} from 'tui-placeholder'; /* ES6 */
```

Then you should call the `generate` method with [options](https://nhnent.github.io/tui.placeholder/latest/module-placeholder.html#.generate) to create virtual placeholders.

``` javascript
var targets = document.getElementByTags('input');

placeholder.generate(targets, { ... });
```

For more information about the API, please see [here](https://nhnent.github.io/tui.placeholder/latest/module-placeholder.html).


## 🔧 Pull Request Steps

TOAST UI products are open source, so you can create a pull request(PR) after you fix issues.
Run npm scripts and develop yourself with the following process.

### Setup

Fork `develop` branch into your personal repository.
Clone it to local computer. Install node modules.
Before starting development, you should check to haveany errors.

``` sh
$ git clone https://github.com/{your-personal-repo}/tui.placeholder.git
$ cd tui.placeholder
$ npm install
$ npm run test
```

### Develop

Let's start development!
You can see your code is reflected as soon as you saving the codes by running a server.
Don't miss adding test cases and then make green rights.

#### Run webpack-dev-server

``` sh
$ npm run serve
$ npm run serve:ie8 # Run on Internet Explorer 8
```

#### Run karma test

``` sh
$ npm run test
```

### Pull Request

Before PR, check to test lastly and then check any errors.
If it has no error, commit and then push it!

For more information on PR's step, please see links of Contributing section.


## 📙 Documents
* [Getting Started](https://github.com/nhnent/tui.placeholder/blob/production/docs/getting-started.md)
* [Tutorials](https://github.com/nhnent/tui.placeholder/tree/production/docs)
* [APIs](https://nhnent.github.io/tui.placeholder/latest)

You can also see the older versions of API page on the [releases page](https://github.com/nhnent/tui.placeholder/releases).


## 💬 Contributing
* [Code of Conduct](https://github.com/nhnent/tui.placeholder/blob/production/CODE_OF_CONDUCT.md)
* [Contributing guideline](https://github.com/nhnent/tui.placeholder/blob/production/CONTRIBUTING.md)
* [Issue guideline](https://github.com/nhnent/tui.placeholder/blob/production/docs/ISSUE_TEMPLATE.md)
* [Commit convention](https://github.com/nhnent/tui.placeholder/blob/production/docs/COMMIT_MESSAGE_CONVENTION.md)


## 🔩 Dependency
* [tui-code-snippet](https://github.com/nhnent/tui.code-snippet) >=1.2.5


## 📜 License

This software is licensed under the [MIT](https://github.com/nhnent/tui.placeholder/blob/production/LICENSE) © [NHN Entertainment](https://github.com/nhnent).
