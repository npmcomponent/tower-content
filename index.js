
/**
 * Module dependencies.
 */

var Emitter = require('tower-emitter');
var accessor = require('tower-accessor');
var proto = require('./lib/proto');
var statics = require('./lib/statics');
var root;

/**
 * Expose `content`.
 */

exports = module.exports = content;

/**
 * Expose `collection`.
 */

exports.collection = [];

/**
 * Public API. Gets an existing content or creates a new one.
 *
 * @param {String} name The content's name.
 * @param {Function} fn Function called on content initialization.
 * @return {Content} A `Content` object.
 * @api public
 */

function content(name, fn) {
  if (exports.collection[name]) return exports.collection[name];

  /**
   * Class representing a specific data segment in the DOM.
   *
   * @class
   *
   * @param {Object} data The content's data.
   * @api public
   */

  function Content(data, parent) {
    this.name = name;
    // all actual attributes/values
    this.data = {};
    this.edges = {};
    this.children = [];
    this.root = 'root' === name ? this : exports.root();
    this.setParent(parent);
    this.accessor = accessor(this, 'data');
    data = Content._defaultAttrs(data, this);
    if (data) this.update(data);
    // for being able to emit events to instances from class.
    Content.instances.push(this);
    Content.emit('init', this);
  }

  Content.prototype = {};
  Content.prototype.constructor = Content;
  Content.id = name;
  Content.attrs = [];
  Content.attrs.__default__ = {};
  Content.methods = {};
  Content.instances = [];
  Content.accessor = accessor(Content);

  // statics

  for (var key in statics) Content[key] = statics[key];

  // proto

  for (var key in proto) Content.prototype[key] = proto[key];

  /**
   * Standard `toString`.
   *
   * @constructor Content
   * @see http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
   * @return {String} A specifically formatted String.
   * @api public
   */

  Content.prototype.toString = function(){
    return '[object Content]';
  };

  if (fn) Content.on('init', fn);

  exports.collection.push(Content);
  exports.collection[name] = Content;
  exports.emit('define', Content);
  return Content;
}

// XXX: not sure where this should go yet.
proto.serialize = function(){
  var json = {};
  var data = this.data;
  for (var key in data) {
    if (content.is(data[key])) {
      json[key] = data[key].serialize();
    } else if (this.constructor.attrs[key]) {
      json[key] = data[key];
    }
  }
  return json;
};

/**
 * Define a nested scope.
 */

statics.scope = function(name){
  // only define once.
  var childName = this.id + '.' + name;
  if (content.defined(childName))
    return content(childName);

  var scope = content(childName);
  scope._parent = this;
  scope.scopeName = name;
  
  this.attr(name, 'object', function(parent, val){
    var obj = scope.init(val, parent);
    // XXX: tmp hack!
    obj.data.name = name;
    return obj.data;
  });

  return scope;
};

/**
 * Mixin `Emitter`.
 */

Emitter(exports);
Emitter(proto);
Emitter(statics);

/**
 * Clear the collections.
 * Used for testing.
 *
 * @chainable
 * @return {Function} exports The main `content` function.
 * @api public
 */

exports.clear = function(){
  exports.off();
  exports.root().remove();
  exports.collection = [];
  root = undefined;
  return this;
};

/**
 * Check if a content has been defined.
 *
 * @param {String} name The content's name.
 * @return {Boolean} true if the `Content` has been defined, but false otherwise.
 * @api public
 */

exports.defined = function(name){
  return exports.collection.hasOwnProperty(name);
};

/**
 * Check if `obj` is a `Content` object
 *
 * @param {Content} obj A content object.
 * @return {Boolean} true if `obj` is a Content object, but false otherwise.
 * @api public
 */

exports.is = function(obj){
  return obj && '[object Content]' === obj.toString();
};

/**
 * Get the initiated root content.
 *
 * @return {Content} The root content.
 * @api public
 */

exports.root = function(){
  if (root) return root;
  return root = content('root').init();
};