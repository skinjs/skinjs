$(document).ready(function() {

  module('Query')

  var query

  test('availability', 1, function() {
    query = skin.Query
    ok(query != undefined, 'skin query is available')
  })

});