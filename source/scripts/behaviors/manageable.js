// skin.js 0.1.3
// © 2013 Soheil Jadidian
// skin.js may be freely distributed under the MIT license
// http://skinjs.org

define('behaviors/manageable', ['skin'], function(skin) {


  // Manageable Behavior
  // ===================
  // provides initialize, configure and finalize sequences
  // for component's lifecycle


  var name = 'manageable', adapter = skin.adapter;

  function initialize() {
    var prototype   = this
      , constructor = prototype.constructor;

    // clone constructor's default settings into prototype's settings
    adapter.extend(prototype.settings, constructor.defaults);

    if (prototype.trigger) prototype.trigger('initialize');
    adapter.each(constructor.initializers, function(initializer) {
      initializer.call(prototype);
    });
  }

  function configure(settings) {
    var prototype   = this
      , constructor = prototype.constructor;

    // update settings
    adapter.extend(prototype.settings, settings);

    if (prototype.trigger) prototype.trigger('configure');
    adapter.each(constructor.configurers, function(configurer) {
      configurer.call(prototype, settings);
    });
  }

  function finalize() {
    var prototype   = this
      , constructor = prototype.constructor;

    if (prototype.trigger) prototype.trigger('finalize');
    adapter.each(constructor.finalizers, function(finalizer) {
      finalizer.call(prototype);
    });
  }


  skin.behaviors[name] = {


    add: function() {
      var prototype   = this
        , constructor = prototype.constructor
        , behaviors   = constructor.behaviors;
      if (constructor.check(name)) return this;

      constructor.defaults     = {};
      constructor.initializers = [];
      constructor.configurers  = [];
      constructor.finalizers   = [];

      prototype.settings   = {};
      prototype.initialize = initialize;
      prototype.configure  = configure;
      prototype.finalize   = finalize;

      behaviors.push(name);
      return this;
    },

    remove: function() {
      var prototype   = this
        , constructor = prototype.constructor
        , behaviors   = constructor.behaviors;
      if (!constructor.check(name)) return this;
    }


  };




  return skin;
});
