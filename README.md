*This repository is a mirror of the [component](http://component.io) module [tower/content](http://github.com/tower/content). It has been modified to work with NPM+Browserify. You can install it using the command `npm install npmcomponent/tower-content`. Please do not open issues or send pull requests against this repo. If you have issues with this repo, report it to [npmcomponent](https://github.com/airportyh/npmcomponent).*
# Tower Content

Data for the DOM.

The scope-accessor graph.

## Installation

```bash
$ component install tower/content
```

## Examples

```js
var content = require('tower-content');

content('menu')
  .attr('items', 'array')
  .attr('selected', 'object')
  .action('select', function(index){
    this.selected = this.items[index];
  });

content('menu').init({ items: [ 'a', 'b' ] }).select(1);
```

## Notes

- http://en.wikipedia.org/wiki/Content_(media)

## License

MIT