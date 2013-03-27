define(function() {
  return {

    templates: {
      pane: '<div class="{{class}}">{{content}}</div>'
    , panel: {
        base: 'pane'
      , content: '<div class="header">{{header}}</div><div class="body">{{body}}</div><div class="footer">{{footer}}</div>'
      }
    , panels: '<div class="{{class}}"><div class="header">{{header}}</div><div class="body">{{body}}</div><div class="footer">{{footer}}</div></div>'
    }

  , actions: {
      show: function() {}
    , hide: function() {}

    , move: function() {}
    , rotate: function() {}
    , scale: function() {}

    , dock: function(element, container, position) {}
    , slide: function() {}
    , follow: function() {}
    }

  , reactions: {
      movable: function() {}
    , rotatable: function() {}
    , scalable: function() {}

    , pressable: function() {}
    , swipable: function() {}
    }

  , recipes: {
      cloak: function() {
        
      }
  }

  }
});