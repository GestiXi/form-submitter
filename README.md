Form Submitter
==============

This plugin make it easy to submit form in GestiXi generated websites.


------

## Installation

form-submitter depends on jQuery. To use it, include this in your page :

    <script src="jquery.js" type="text/javascript"></script>
    <script src="form-submitter.js" type="text/javascript"></script>


------

## Usage

To use Form Submitter, you just need to do this:

    $(function() {
      $(".form-container").formSubmitter({
        // options if needed
      });
    });

The receiver can be either a form or a DOM element containing a form.

Your server will have to respond a JSON encoded object with the following optionnals parameters :

- **notification**: an HTML Bootstrap alerts.
- **helpInline**: a JSON encoded object with the name of the input field as a key and the error as a value.
- **redirectUrl**: on URL to redirect the page to.

If this is too opinionated for you, feel free to fork it and adapte it to your use case.

------

## Options


### willSend *{function}*

Delegate called before form submission.

Return `false` to prevent form submitting.

Example:

    $('form').formSubmitter({ 
      willSend: function() {
        return true;
      }
    });


### formSettings *{function}*

Delegate called to get the form data.

Example:

    $('form').formSubmitter({ 
      formSettings: function(evt) {
        var $form = this.$form;

        return {
          method: $form.attr("method"),
          url: $form.attr("action"), 
          data: $form.serialize()
        };
      }
    });


### didSend *{function}*

Delegate called after form submission.


### willReceive *{function}*

Delegate called before the response handling.


### didReceive *{function}*

Delegate called after the response handling.


### notificationLayout *{string}*

Layout of the notifications.

Default: 'position:fixed;top:10px;left:10px;width:350px;z-index:1000;'


------

## Properties


## element

The DOM element.

Example:

    $('form').formSubmitter({ 
      didSend: function(evt) {
        console.log(this.element);
      }
    });


### $form

The jQuery form element.

Example:

    $('form').formSubmitter({ 
      didSend: function(evt) {
        console.log(this.$form);
      }
    });


### options

The options object.



------

## Author

**Nicolas Badia**

+ [https://twitter.com/@nicolas_badia](https://twitter.com/@nicolas_badia)
+ [https://github.com/nicolasbadia](https://github.com/nicolasbadia)

------

## Copyright and license

Copyright 2013-2015 GestiXi under [The MIT License (MIT)](LICENSE).
