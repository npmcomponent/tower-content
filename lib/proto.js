
/**
 * Get attr.
 */

exports.get = function(name){
  if ('function' === typeof this[name]) return this[name]();
  if (undefined !== this[name]) return this[name];

  // try getting default value
  var attr = this.constructor.attrs[name];
  if (attr && attr.hasOwnProperty('value'))
    return this[name] = attr.value;

  // try getting value from parent
  // XXX: not sure if it should cache
  if (this.parent) return this.parent.get(name);
};

/**
 * Set attr.
 */

exports.set = function(name, val){
  return this[name] = val;
};

/**
 * Emit `'remove'` event for directives
 * to teardown custom functionality for their element.
 */

exports.remove = function(){
  for (var i = 0, n = this.children.length; i < n; i++) {
    this.children[i].remove();
  }
  this.emit('remove');
  // XXX: not sure this is necessary
  this.constructor.emit('remove', this);
  return this;
}

/**
 * Standard `toString`.
 *
 * @see http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
 */

exports.toString = function(){
  return '[object Scope]';
}