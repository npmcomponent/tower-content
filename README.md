# Tower Content

Data for the DOM.

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

## License

MIT