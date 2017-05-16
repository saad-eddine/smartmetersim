// Example model


function Device (id, cs) {
  this.id = id;
  this.cs = cs;
  this.appliances = []
}

Device.prototype.getDeviceId = function () {
  return this.id
}

Device.prototype.getonnectionString = function () {
  return this.cs
}

Device.prototype.setAppliances = function (appl) {
  this.appliances = appl;
}

Device.prototype.getAppliances = function () {
  return this.appliances;
}

module.exports = Device;

