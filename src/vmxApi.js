var vmxApi;
(function(window){
"usex strict";
/*Constructor*/
vmxApi = window.vmxApi = function(selector){
   console.log("called vmxApi constructor with selector:",selector);
   console.log("this is ", this);
  return new VmxApi(selector);
};


var  VmxApi = function(selector){
  console.log("called VmxApi constructor with selector:",selector);
  console.log("this is ", this);
  //A hashed array, keyed my model name
  //Each element is itself an array of detectors
  if (!this.detectors) { this.detectors = {}; }
  if(selector && !(this.$selected = this.detectors[selector])) {
     throw "No detector";
  }
  return this;
};

vmxApi.fn = VmxApi.prototype = {
  constructor: vmxApi,
  reset: function() {
    this.detectors = {};
  },
  processServerResponse : function(params){
    var detections   = params.detections;
    var model_name   = params.name || detections[0].cls;
    var connectionId = params.connectionId;
    var _detector;
    var _like_detectors;
    if(_like_detectors = this.detectors[model_name]){
      /* There are already detectors for this model running */
      if (_detector = _like_detectors[connectionId]){
        /* This model is already running, and we should do something */
        //what do when it already exists?
        return this;
      } else {
        /* This is the first time a detector has fired for this model */
        _detector = this.detectors[model_name][connectionId] = detections;
        return this;
      }
    } else {
      /* This is the first firing of ANY detector for this model_name */
      this.detectors[model_name] = {};
      this.detectors[model_name][connectionId] = detections;
    }
    console.log("process_server_response called for", model_name);
    return this;
  },
  everDetected : function(){
    return this.$selected !== undefined;
  }
};

/*for convenience, let the api look like an object for methods that don't need a selector */
vmxApi.reset = vmxApi().reset;
vmxApi.processServerResponse = vmxApi().processServerResponse;

})(window);

console.log("about to call vmxApi in definition");
vmxApi("muhSelector");
