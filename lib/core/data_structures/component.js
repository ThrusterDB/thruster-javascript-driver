"use strict";

/**
 * @author Victor O. Santos Uceta
 * Graph component super class.
 * @module lib/core/data_structures/component
 * @see module:core/data_structure/graph
 */

/* class modules */
const Message = require('../communication/message');
const uuid = require('node-uuid');
const _ = require('lodash');
const Joi = require('joi');

/** Graph component super class */
class Component {

  /**
   * Create a template object.
   * @param {object} [param= {}] - Parameter with default value of object {}.
   * @param {string} type - The component type.
   */
  constructor(param = {}, type, g) {

    /* This session reference */
    this.__ref = uuid.v1();
    /* This component type */
    this.__type = type;
    /* This component parent graph, if null, this is the graph itself */
    this.__parentGraph = g || this;
    /* debug flag */
    this.__debug = param.debug;

    /* The internal id of the component */
    this._id = param.id || null;
    /* The component label */
    this._label = param.label || null;
    /* Component custom properties */
    this._prop = param.prop || {};
    /* Component custom computed fields */
    this._computed = param.computed || {};
    /* Component metadata */
    this._meta = param.meta || {};
  }

  /**
   * Validates the Graph object schema.
   * @return {promise} A promise for the validation result.
   */
  static validate(c, schema) {
    /* return validation promise */
    return new Promise((resolve, reject)=> {
      Joi.validate(c, schema, {abortEarly: false}, (err, value)=> {
        if (err) {
          reject(err);
        } else {
          resolve(value);
        }
      });
    });
  }

  /*********************** GETTERS AND SETTERS ***********************/
  getId() {
    return this._id;
  }

  setId(value) {
    this._id = value;
  }

  getRef() {
    return this.__ref;
  }

  isDirty() {
    return this._isDirty;
  }

  getLabel() {
    return this._label;
  }

  setLabel(value) {
    this._label = value;
  }

  /*********************** PROPERTIES ***********************/

  properties() {
    return Object.freeze(this._prop);
  }

  /* Properties collection methods */
  setProperty(prop, value) {

    /* validating the prop type */
    this._validatePropAndVal(prop, value);
    /* Adding the property */
    this._prop[prop] = value;
  }

  getProperty(prop) {
    /* validating the prop type */
    this._validatePropAndVal(prop, '');
    /* getting the property */
    return this._prop[prop]
  }

  removeProperty(prop) {

    /* validating the prop type */
    this._validatePropAndVal(prop, '');
    /* Removing the property */
    delete this._prop[prop];
  }

  /*********************** COMPUTED ***********************/

  computed() {
    return Object.freeze(this._computed);
  }


  /* Computed collection methods */
  setComputed(algo, prop, value) {

    /* validating the algo type */
    this._validateAlgoType(algo);
    /* validating the prop type */
    this._validatePropAndVal(prop, value);
    /* if algo property does not exist, create it */
    if (!this._computed[algo]) {
      this._computed[algo] = {};
    }
    /* Adding the property */
    this._computed[algo][prop] = value;

  }

  getComputed(algo, prop) {

    /* validating the algo type */
    this._validateAlgoType(algo);
    /* validating the prop type */
    this._validatePropAndVal(prop, '');
    /* if algo property does not exist */
    if (!this._computed[algo]) {
      throw new Error('Provided algorithm(' + algo + ') is not present');
    }
    if (!this._computed[algo][prop]) {
      throw new Error('Provided algorithm property(' + prop + ') is not present');
    }

    /* Getting the property */
    return this._computed[algo][prop];

  }

  removeComputed(algo, prop) {

    /* validating the algo type */
    this._validateAlgoType(algo);
    /* validating the prop type */
    this._validatePropAndVal(prop, '');
    /* if algo property does not exist */
    if (!this._computed[algo]) {
      throw new Error('Provided algorithm(' + algo + ') is not present');
    }
    if (!this._computed[algo][prop]) {
      throw new Error('Provided algorithm property(' + prop + ') is not present');
    }
    /* removing the property */
    delete this._computed[algo][prop];
  }

  /*********************** META ***********************/

  meta() {
    return Object.freeze(this._meta);
  }

  getMeta(prop) {

    /* validating the prop type */
    this._validatePropAndVal(prop, '');
    /* Getting the property */
    return Object.freeze(this._meta[prop]);
  }

  /*********************** VALIDATION ***********************/
  /* Validation methods */
  _validateAlgoType(algo) {
    if (!/^string$/.test(typeof algo)) {
      throw new Error('Algorithm name must be of type: string');
    }
  }

  _validatePropAndVal(prop, value) {

    /* validating the prop type */
    if (!/^string$/.test(typeof prop)) {
      throw new Error('Property name must be of type: string');
    }
    /* validating the value type */
    if (!/^(boolean|number|string)$/.test(typeof value) && !(value instanceof Date) && !(value instanceof Array) && !(value instanceof Object)) {
      throw new Error('Property value must be of type: boolean | number | string | Date| Array| Object');
    }
  }

  /*********************** REMOTE OPERATIONS ***********************/
  /**
   * Persist the component changes in the remote database.
   */
  persist() {
    /* This instance object reference */
    let self = this;
    const apiFunc = 'ex_persist';

    /* If label is not present throw error */
    if (!this.__parentGraph.getLabel()) {
      throw new Error('Graph label is required to persist');
    }

    /* If label is not present throw error */
    if (this.__type == 'g') {
      this.setId(this.getLabel());
    }

    /* Build this object properties */
    let obj = {};
    Object.keys(this).map((k)=> {
      if (!k.includes('__')) {
        obj[k.substring(1)] = self[k];
      }
    });

    /* building the message */
    let msg = Message.buildMessage({
      payload: {
        graph: this.__parentGraph.getLabel(),
        type: this.__type,
        obj: obj
      }
    });

    /* if debug display operation params */
    if (this.__debug) {
      console.log('DEBUG[persist]: ', apiFunc, JSON.stringify(msg));
    }

    /* if bulk area is open, push and return */
    if (this.__parentGraph.__conn._isBulkOpen) {
      this.__parentGraph.__conn.pushOperation(apiFunc, msg);
      return;
    }
    /* return promise with the async operation */
    return new Promise((resolve, reject)=> {
      console.log(apiFunc, msg);
      self.__parentGraph.__conn._rpc.call(apiFunc, msg).then((msg)=> {
        /* set incoming id */
        self.setId(msg._id);
        resolve(msg._id);
      }, (error)=> {
        reject(error);
      });
    });
  }

  /**
   * Destroy component(s) at the remote database.
   * @param {string} [cmp] - The component type, can be 'v','V', 'e','E', 'g', or 'G'
   * @param {Filter} [ftr] - The filter to be applied
   */
  destroy(cmp, ftr) {

    /* This instance object reference */
    let self = this;
    const apiFunc = 'ex_destroy';

    /* The message reference */
    let msg;

    /* Extracting filters if provided */
    if (ftr) {
      ftr = ftr.getFilters();
    }

    /* deciding which component to destroy */
    if (this.__type == 'g' && cmp) {
      /* validating component */
      this._validateCmp(cmp);
      /* building message */
      msg = Message.buildMessage({
        payload: {
          graph: this.__parentGraph.getLabel(),
          type: cmp.toLowerCase(),
          ftr: ftr
        }
      });
    } else if (this.getId()) {
      /* building message */
      msg = Message.buildMessage({
        payload: {
          graph: this.__parentGraph.getLabel(),
          type: this.__type,
          id: this.getId()
        }
      });
    } else {
      /* Error if id is not present */
      throw new Error('Component id is required ', this);
    }

    /* if debug display operation params */
    if (this.__debug) {
      console.log('DEBUG[destroy]: ', apiFunc, JSON.stringify(msg));
    }

    /* if bulk area is open, push and return */
    if (this.__parentGraph.__conn._isBulkOpen) {
      this.__parentGraph.__conn.pushOperation(apiFunc, msg);
      return;
    }
    /* return promise with the async operation */
    return new Promise((resolve, reject)=> {
      self.__parentGraph.__conn._rpc.call(apiFunc, msg).then((msg)=> {
        resolve(msg.payload);
      }, (err)=> {
        reject(err);
      });
    });
  }

}


/* exporting the module */
module.exports = Component;