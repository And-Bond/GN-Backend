const handlebars = require('handlebars')

handlebars.registerHelper('add', function (a, b) {
    return a + b;
  });