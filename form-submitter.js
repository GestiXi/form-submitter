// ==========================================================================
// Project:     Form Submitter
// Description: jQuery plugin used in GestiXi websites to handle form submission
// Copyright:   ©2013-2016 GestiXi
// License:     Licensed under the MIT license (see LICENCE)
// Version:     1.1
// Author:      Nicolas BADIA
// ==========================================================================

!function($) { "use strict";

  // ..........................................................
  // FORM SUBMITTER PLUGIN DEFINITION
  //

  $.fn.formSubmitter = function( option ) {

    return this.each(function() {
      var $this = $(this),
        $form = $this[0].tagName === 'FORM' ? $this.parent().find('form') : $this.find('form'),
        data = $form.data('formSubmitter');

      if (!data) {
        var options = $.extend({}, $.fn.formSubmitter.defaults, typeof option == 'object' && option);

        $form.data('formSubmitter', (data = new FormSubmitter(this, $form, options)));

        $form.find("input[type=submit]").on('click', function() {
          $form.find("input[type=submit]").removeAttr("clicked");
          $(this).attr("clicked", "true");
        });

        $form.on('submit', function(evt) {
          evt.preventDefault();

          var canSubmit = options.willSend.call(data, evt);
          if (canSubmit) {
            var clickedButton = $("input[type=submit][clicked=true]");
            clickedButton.prop('disabled', true);
            data.clickedButton = clickedButton;

            data.handler(evt);
            options.didSend.call(data, evt);
          }
        });
      }
      else {
        console.warn('formSubmitter is already handling the form');
      }
    })
  }

  $.fn.formSubmitter.defaults = {

    /**
      Delegate called before form submission.

      Return `false` to prevent form submitting.

      Example:

          $('form').formSubmitter({
            willSend: function() {
              return true;
            }
          });

      @type Function
      @param {Event} evt
      @returns {Boolean} true to submit the form
      @since Version 1.0
    */
    willSend: function(evt) {
      return true;
    },

    /**
      Delegate called to get the form data.

      @type Function
      @param {Event} evt
      @returns {String} the data to send
      @since Version 1.0
    */
    formSettings: function(evt) {
      var $form = this.$form,
        settings = {
          method: $form.attr("method"),
          url: $form.attr("action"),
          data: $form.serialize()
        };

      // FormData add input file support but is not supported in IE9
      if (window.FormData !== undefined) {
        settings.cache = false;
        settings.contentType = false;
        settings.processData = false;
        settings.data = new FormData($form[0]);
      }

      return settings;
    },

    /**
      Delegate called after form submission.

      @type Function
      @param {Event} evt
      @since Version 1.0
    */
    didSend: function(evt) {},

    /**
      Delegate called before the response handling.

      @type Function
      @param {String} response
      @returns {String} the response to handle
      @since Version 1.0
    */
    willReceive: function(response) {
      return JSON.parse(response);
    },

    /**
      Delegate called after the response handling.

      @type Function
      @param {String} response
      @since Version 1.0
    */
    didReceive: function(response, result) {},

    /**
      Duration of the notifications in milliseconds.

      @type String
      @since Version 1.1
    */
    notificationDelay: 8000,

    /**
      Layout of the notifications.

      @type String
      @since Version 1.0
    */
    notificationLayout: 'position:fixed;top:10px;left:10px;width:350px;z-index:1000;'
  }

  // ..........................................................
  // FORM SUBMITTER PUBLIC CLASS DEFINITION
  //

  var FormSubmitter = function(element, $form, options) {
    this.element = element;
    this.$form = $form;
    this.options = options;
  }


  $.fn.formSubmitter.Constructor = FormSubmitter


  FormSubmitter.prototype = {

    constructor: FormSubmitter,

    /**
      The initial element.

      @type DOM Element
    */
    element: null,

    /**
      The jQuery form element.

      @type jQuery Element
    */
    $form: null,

    /**
      The passed options.

      @type Object
    */
    options: null,

    /**
      Will submit the form.

      @type Function
      @param {Event} evt
    */
    handler: function(evt) {
      var that = this,
        options = this.options,
        settings = options.formSettings.call(this, evt);

      $.ajax(settings).done(function(response) {
        var clickedButton = that.clickedButton;
        if (clickedButton) clickedButton.prop('disabled', false);

        var parsedResponse = options.willReceive.call(that, response);

        if (parsedResponse) {
          var result = that.handleResponse(parsedResponse);

          options.didReceive.call(that, parsedResponse, result);
        }
      });

      return false;
    },

    /**
      Will handle the response.

      @type Function
      @param {String} response
    */
    handleResponse: function(response) {
      var $form = this.$form,
        notification = response.notification,
        helpInline = response.helpInline,
        submitForm = response.submitForm,
        redirectUrl = response.redirectUrl;

      if (redirectUrl) {
        document.location.href = redirectUrl;
      }

      if (submitForm) {
        this.submitForm(submitForm);
      }

      $('.help-inline').html('');
      $('.form-group').removeClass('has-error');

      if (helpInline) {
        helpInline = JSON.parse(helpInline);

        for (var name in helpInline) {
          var $helpInline = $form.find('.help-inline.'+name);

          $helpInline.html(helpInline[name]);
          $helpInline.closest('.form-group').addClass('has-error');
        }
      }

      if (notification) this.notify(notification);

      return response;
    },

    /**
      Display a Bootstrap notification.

      @type Function
      @param {String} html
      @since Version 1.0
    */
    notify: function (notification) {
      var options = this.options,
        notificationDelay = options.notificationDelay;

      if (!$('#notification-container').length) {
        var layout = this.options.notificationLayout;

        $('<div id="notification-container" style="'+layout+'"></div>').appendTo('body');
      }

      var $notification = $(notification);

      $notification
        .hide()
        .appendTo('#notification-container')
        .slideDown()
        .delay(notificationDelay)
        .fadeOut(400, function() {
          $notification.remove();
        });
    },

    /**
      Helper used to submit a form.

      The form must have the following format:

          {
            method: 'post',
            action: 'https://www.gestixi.com/gx-handle-form',
            inputs: [
              {
                type: 'text',
                name: 'title',
                value: 'example'
              }
            ]
          }

      @type Function
      @param {Object} form
      @since Version 1.0
    */
    submitForm: function (submitForm) {
      var form = JSON.parse(submitForm),
        formEl = document.createElement("form");

      formEl.setAttribute("method", form.method || "post");
      formEl.setAttribute("action", form.action);

      for (var i = 0; i < form.inputs.length; i++) {
        var input = form.inputs[i],
          inputEl = document.createElement("input");

        inputEl.setAttribute("type", input.type || "hidden");
        inputEl.setAttribute("name", input.name);
        inputEl.setAttribute("value", input.value);

        formEl.appendChild(inputEl);
      };

      document.body.appendChild(formEl);
      formEl.submit();
    }
  }

}(window.jQuery);
