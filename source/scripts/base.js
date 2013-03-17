define('base', function() {
  return {
    templates: {
      pane: '<div class="{{class}}">{{content}}</div>',
      panel: '<div class="{{class}}"><div class="header">{{header}}</div><div class="body">{{body}}</div><div class="footer">{{footer}}</div></div>'
    },
    actions: {
      dock: function(element, mode) {}
    }
  }
});