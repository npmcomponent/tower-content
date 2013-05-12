# Tower Scope

Data for the DOM.

## Installation

```bash
$ component install tower/scope
```

## Examples

```js
var scope = require('tower-scope');

scope('menu')
  .attr('items', 'array')
  .attr('selected', 'object')
  .action('select', function(index){
    this.selected = this.items[index];
  });

scope('menu').init({ items: [ 'a', 'b' ] }).select(1);
```

## License

MIT