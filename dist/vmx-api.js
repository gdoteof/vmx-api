/*! vmx-api - v0.0.0 - 2013-10-31
* Copyright (c) 2013 ; Licensed  */
var vmxApi;
(function(){
"use strict";
var inited = false;
var _vmxApi;

function VmxApi(){
   // `detectors` is a hashed array, keyed by model name; 
   //  Each element is itself a hashed array of detectors, keyed by connectionId
   var detectors = {};

   // `callbacks` is a hashed array, keyed by model name,
   // each element is a an array of callbacks, keyed by callback type
   // ex:
   
   // * callbacks
   //      0. face
   //          - onEnter : function(){ console.log("entered face"); },
   //          - onExit : function(){ console.log("face left"); },
   //      1. hand
   //          - onEnter : function(){ console.log("entered hand"); },
   //          - onExit : function(){ console.log("no more hand"); },
   
   var callbacks = {};

   var fireEnteredCallback = function(model_name){
      if( !callbacks[model_name] || !callbacks[model_name]['onEnter']) {
        // Fail silently if nothing to do
        return this;
      }
      // Execute the callback
      callbacks[model_name]['onEnter']();
      return this;
   };

  return {
    reset: function() {
      detectors = {};
    },
    select : function(selector){
      this.selector = selector;
      if(selector && !(this.$selected = detectors[selector])) {
        this.$selected = null;
      }
      return this;
    },
    processServerResponse : function(params){
      var detections   = params.detections;
      var model_name   = params.name || detections[0].cls;
      var connectionId = params.connectionId;
      var _detector;
      var _like_detectors;
      if(_like_detectors = detectors[model_name]){
        // There are already detectors for this model running 
        if (_detector = _like_detectors[connectionId]){
          // This model is already running, and we should do something 
          // NOTE: what do when it already exists?
          return this;
        } else {
          // This is the first time a detector has fired for this model
          _detector = detectors[model_name][connectionId] = detections;
          return this;
        }
      } else {
        // This is the first firing of ANY detector for this model_name 
        detectors[model_name] = {};
        detectors[model_name][connectionId] = detections;
        fireEnteredCallback(model_name);
      }
      console.log("process_server_response called for", model_name);
      return this;
    },
    onEnter : function(callbackFunction){
      if(!callbacks[this.selector]) { callbacks[this.selector] = {}; }
      callbacks[this.selector]['onEnter'] = callbackFunction; 
    },
    everDetected : function(){
      // This weird check makes sure that $selected hasn't changed itself to something that is falsy but not 'null'
      return (this.$selected !== null && !!(this.$selected));
    },
  };
}

vmxApi = function(selector){
  if(!inited){
    _vmxApi = new VmxApi();
    inited = true;
  }
  if(selector){
    return _vmxApi.select(selector);
  } else {
    return _vmxApi;
  }
};
vmxApi();

vmxApi.reset = _vmxApi.reset;
vmxApi.processServerResponse = _vmxApi.processServerResponse;


})();
