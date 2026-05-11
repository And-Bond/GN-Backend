import handlebars from 'handlebars'

handlebars.registerHelper('add', function (a, b) {
  return a + b;
});

export default handlebars