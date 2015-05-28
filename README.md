# generator-fe-scaffold

### how to use

install yeoman in global.

```bash
npm install -g yeoman
```

clone this repository anywhere in your local machine.

```bash
git clone https://github.nhnent.com/fe/generator-fe-scaffold.git
```

enter below command in this generator's root directory.

```bash
npm link
```

done. just use it.

```bash
yo fe-scaffold
```


### available options

```
--skip-install      Skip auto install dependencies (npm install & bower install).
```

### features

- support test automation with karma-webdriver-launcher
 - IE7 - WinXP
 - IE8 - WinXP
 - IE9 - Win7
 - IE10 - Win7
 - IE11 - Win7
 - Chrome - Win7,
 - Firefox - Win7,
 - Mobile Chrome (39) - Android 5.1
 - Mobile Safari (8.0) - iOS 8.3
- gulp connect server
- eslint
- jsdoc (fedoc template)
- CI (http://fe.nhnent.com:8080/jenkins) ready

