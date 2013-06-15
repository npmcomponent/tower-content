
/**
 * Module that handles the data for the DOM.
 *
 * @module content
 */

/**
 * Module dependencies.
 */

var indexOf = require('indexof')
var slice = [].slice;

/**
 * Get attr.
 *
 * Attributes can be functions.
 * However, an `action` can not be called through `get`.
 *
 * @param {String} A path delimited by periods `.`.
 * @return {Mixed} An attribute.
 */

exports.get = function(path){
  path = path.split('.');
  var val = findAttr(this, path.shift());

  // XXX: refactor to more generic/better system.
  while (path.length && undefined !== val) {
    var name = path.shift();
    if (val.hasOwnProperty(name)) {
      val = val[name];
    // XXX: unoptimized, but should work for the moment.
    } else if ('function' === typeof val.get) {
      val = val.get([name].concat(path).join('.'));
      path = [];
    } else {
      val = undefined;
    }
  }

  return val;
};

/**
 * Set attr.
 *
 * @param {String} name The attribute's name.
 * @param {Mixed} val The attribute's value.
 * @return {Object} The attribute's value.
 */

exports.set = function(name, val){
  // XXX: set for `nested.path`.
  // XXX: make better comparator.
  if (this.attrs[name] !== val) {
    var prev = this.attrs[name];
    this.attrs[name] = val;
    // XXX: maybe it looks for `dependencies` on
    //      `this.constructor.attrs[name].dependencies`,
    //      to see if it should emit change events for computed props.
    this.changed(name, val, prev);
  }

  return val;
};

exports.update = function(data){
  for (var key in data) this.set(key, data[key]);
  return this;
};

/**
 * Trigger the `change` event on an attribute.
 *
 * @param {String} name The attribute's name.
 * @param {Mixed} val The attribute's value.
 * @param {Object} prev The attribute's previous value.
 */

exports.changed = function(name, val, prev){
  this.emit('change ' + name, val, prev);
  this.emit('change', name, val, prev);
};

/**
 * Simple wrapper around `.on('change <attr>')`.
 *
 * @param {String} attr The attribute's name.
 * @param {Function} fn The callback to trigger when on an attribute's change event.
 */

exports.watch = function(attr, fn){
  return this.on('change ' + attr, fn);
};

/**
 * Apply an action.
 *
 * @param {String} name The action's name.
 * @param {Array} args The action's list of parameters.
 * @return {Function} The named action.
 */

exports.apply = function(name, args){
  return findAction(this, name).apply(this, args);
};

/**
 * Call an action.
 * @param {String} name The action's name.
 * @return {Function} The named action.
 */

exports.call = function(name){
  return findAction(this, name).apply(this, slice.call(arguments, 1));
};

/**
 * Emit `'remove'` event for directives
 * to teardown custom functionality for their element.
 *
 * @chainable
 *
 * @return {this} self.
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
 * @return {String} A specifically formatted String.
 */

exports.toString = function(){
  return '[object Content]';
};

/**
 * Traverse content tree to find attribute.
 *
 * @param {Content} content The starting content.
 * @param {String} name The attribute's name.
 * @return {Object} The named attribute.
 */

function findAttr(content, name) {
  while (content) {
    // the order of lookups:
    // this.attrs[name]
    // this.constructor.attrs[name].value // default
    // this.parent.get(name);
    if (undefined !== content.attrs[name]) return content.attrs[name];

    // try getting default value
    var attr = content.constructor.attrs[name];
    if (attr && attr.hasDefaultValue)
      return content.attrs[name] = attr.apply(content);
    // try getting value from parent
    // XXX: not sure if it should cache
    content = content.parent;
  }
}

/**
 * Traverse content tree to find action `fn`.
 *
 * @param {Content} content The starting content.
 * @param {String} name The action's name.
 * @return {Function} The named action.
 */

function findAction(content, name) {
  while (content) {
    if (content.constructor.actions[name])
      return content.constructor.actions[name];
    content = content.parent;
  }

  throw new Error('content action [' + name + '] not found.');
}