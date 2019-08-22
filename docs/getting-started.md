### What is the placeholder component?

First described in ```placeholder```.  
```placeholder``` is a supported feature in html5, this is a hint that you need to enter the 'what'.

As follows you use ```placeholder``` property to the input tag.

```html
<input type="text" placeholder="enter your id" />
<input type="password" placeholder="enter your password" />
```

Unfortunately, previous versions of IE9 apply ```placeholder``` property, even if it did not show on the screen.  
When the IE10, 11 can use the ```placeholder``` property, but there are issues focusing on the input tag is set to disappear in the ``` placeholder``` content.

To solve these problems **placeholder component** is created.

Now, you can meet ```placeholder``` in IE8~11.


### How to use the placeholder component?

**Step 1. The script loads the associated file in a html page. (Now code-snippet.js is supported below v1.1.3)**
```html
....
<script type="text/javascript" src="tui-code-snippet.js"></script>
<script type="text/javascript" src="tui-placeholder.js"></script>
....
```

**Step 2. Call a function to create a placeholder in three ways.**

* Way 1. Load script files, and you can add a script under html ends.
```html
<html>
   <head></head>
   <body>
      ....
      <script type="text/javascript">
          tui.placeholder.generate();
      </script>
   </body>
</html>
```
> The above way can create a placeholder is the fastest, but if you go back to the page, enter the letters occur in the `<input>` may overlap the placeholder text. In this case, call the `hideOnInputHavingValue` API ending at the time the page loads. See below.

```javascript
tui.placeholder.generate();

$(document).ready(function() {
    tui.placeholder.hide();
});
```

* Way 2. If you use native JavaScript, you can call in ```onload``` event completion function.  
(The virtual placeholder is generated after loading all image files)

```javascript
function makePlaceholder() {
    tui.placeholder.generate();
}

if (window.addEventListener) {
    window.addEventListener('load', makePlaceholder, false);
} else if (window.attachEvent) {
    window.attachEvent('onload', makePlaceholder);
} else if (window.onLoad) {
    window.onload = makePlaceholder;
}
```
* Way 3. If you use jQuery, you can call in ```ready``` function.  
(You can create a placeholder faster and more reliably then Way 2)
```javascript
$(document).ready(function() {
    tui.placeholder.generate();
});
```

### If you want to put a placeholder for dynamically generated tags?

Call a function generating placeholder once pass the dynamically generated tag list as a parameter.

Also, the placeholder must be removed by calling `tui.placeholder.remove()` API before deleting the tag that attached the placeholder.

For more information, please refer to the following [examples](https://nhn.github.io/tui.placeholder/latest/tutorial-example01-basic)!
