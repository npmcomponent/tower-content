
/**
 * Module dependencies.
 */

var indexOf = require('indexof')
  , slice = [].slice;

/**
 * Get attr.
 *
 * Attributes can be functions.
 * However, an `action` can not be called through `get`.
 */

exports.get = function(path){
  path = path.split('.');
  var val = findAttr(this, path.shift());

  // XXX: refactor to more generic/better system.
  while (path.length && undefined !== val) {
    var name = path.shift();
    if (val.hasOwnProperty(name))
      val = val[name];
    else
      val = undefined;
  }

  return val;
};

/**
 * Set attr.
 */

exports.set = function(name, val){
  // XXX: make better comparator.
  if (this.attrs[name] !== val) {
    var prev = this.attrs[name];
    this.attrs[name] = val;
    // XXX: maybe it looks for `dependencies` on
    //      `this.constructor.attrs[name].dependencies`,
    //      to see if it should emit change events for computed props.
    this.emit('change', name, val, prev);
  }

  return val;
};

/**
 * Apply an action.
 */

exports.apply = function(name, args){
  return findAction(this, name).apply(this, args);
};

/**
 * Call an action.
 */

exports.call = function(name){
  return findAction(this, name).apply(this, slice.call(arguments, 1));
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

  var i = indexOf(this.constructor.instances, this);
  if (i >= 0)
    this.constructor.instances.splice(i, 1);
  return this;
};

/**
 * Standard `toString`.
 *
 * @see http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
 */

exports.toString = function(){
  return '[object Scope]';
};

function findAttr(scope, name) {
  while (scope) {
    // the order of lookups:
    // this.attrs[name]
    // this.constructor.attrs[name].value // default
    // this.parent.get(name);
    if (undefined !== scope.attrs[name]) return scope.attrs[name];

    // try getting default value
    var attr = scope.constructor.attrs[name];
    if (attr && attr.hasDefaultValue)
      return scope.attrs[name] = attr.apply(scope);
    // try getting value from parent
    // XXX: not sure if it should cache
    scope = scope.parent;
  }
}

/**
 * Traverse scope tree to find action `fn`.
 *
 * @param {Scope} scope starting scope
 * @param {String} name
 * @return {Function}
 */

function findAction(scope, name) {
  while (scope) {
    if (scope.constructor.actions[name])
      return scope.constructor.actions[name];
    scope = scope.parent;
  }

  throw new Error('scope action [' + name + '] not found.');
}