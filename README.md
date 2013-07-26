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