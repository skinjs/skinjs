// Skin.js 0.1.4
// © 2013 Soheil Jadidian
// Skin.js may be freely distributed under the MIT license
// http://skinjs.org

define('behaviors/manageable', ['skin'], function(Skin) {

  // Manageable Behavior
  // ===================
  // provides initialize, configure and finalize sequences
  // for component's lifecycle

  var name = 'Manageable', Tools = Skin.Tools;

  function initialize() {
    var prototype   = this
      , constructor = prototype.constructor;

    // clone constructor's default settings into prototype's settings
    Tools.extend(prototype.settings, constructor.defaults);

    if (prototype.trigger) prototype.trigger('initialize');
    Tools.each(constructor.initializers, function(initializer) {
      initializer.call(prototype);
    });
  }

  function configure(settings) {
    var prototype   = this
      , constructor = prototype.constructor;

    // update settings
    Tools.extend(prototype.settings, settings);

    if (prototype.trigger) prototype.trigger('configure');
    Tools.each(constructor.configurers, function(configurer) {
      configurer.call(prototype, settings);
    });
  }

  function finalize() {
    var prototype   = this
      , constructor = prototype.constructor;

    if (prototype.trigger) prototype.trigger('finalize');
    Tools.each(constructor.finalizers, function(finalizer) {
      finalizer.call(prototype);
    });
  }

  Skin.Behaviors[name] = {

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

  return Skin;
});
