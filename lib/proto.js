
/**
 * Get attr.
 *
 * Attributes can be functions.
 * However, an `action` can not be called through `get`.
 */

exports.get = function(name){
  // the order of lookups:
  // this.attrs[name]
  // this.constructor.attrs[name].value // default
  // this.parent.get(name);
  if (undefined !== this.attrs[name]) return this.attrs[name];

  // try getting default value
  var attr = this.constructor.attrs[name];
  if (attr && attr.hasDefaultValue)
    return this.attrs[name] = attr.apply(this);

  // try getting value from parent
  // XXX: not sure if it should cache
  if (this.parent) return this.parent.get(name);
};

/**
 * Set attr.
 */

exports.set = function(name, val){
  return this.attrs[name] = val;
};

/**
 * Apply an action.
 */

exports.apply = function(name, args){
  return this.constructor.actions[name].apply(this, args);
}

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