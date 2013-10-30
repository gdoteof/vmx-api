'use strict';

/*Constructor*/
function vmxApi(selector){
  return new VmxApi(selector);
}

var  VmxApi = function(selector){
   return this.$selected = detectors[selector]; 
}

vmxApi.fn = VmxApi.prototype = {
  //A hashed array, keyed my model name
  //Each element is itself an array of detectors
  var detectors = {};

  processServerResponse : function(params){
    var detections   = params.detections;
    var model_name   = params.name || detections[0].cls;
    var connectionId = params.connectionId;
    var _detector;
    if(var _like_detectors = detectors[model_name]){
      /* There are already detectors for this model running */
      if (_detector = _like_detectors[connectionid]){
        /* This model is already running, and we should do something */
        //what do when it already exists?
        return this;
      } else {
        /* This is the first time a detector has fired for this model */
        _detector = detectors[model_name][connectionId] = detections;
        return this;
      }
    } else {
      /* This is the first firing of ANY detector for this model_name */
      detectors[model_name] = {};
      detectors[model_name][connectionId] = detections;

    }
    console.log("process_server_response called for", model_name);
    return this;
  },

  everDetected : function{
    return this.$selected != undefined;
  }

}


//  this.reset = function(){
//    detectors = {}
//  }

//  return this;
//}

//VmxApi.prototype.dub = function(number) {
//  process_server_response(null,"themodelname"); 
//  return number * 2;
//};
