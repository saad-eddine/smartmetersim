// Example model


function Device(id, cs) {
  this.id = id;
  this.cs = cs;
  this.key = '';
  this.appliances = [];
  this.location = 'not set';
  this.fw_version = 'not set';
  this.connType = 'not set'

}

Device.prototype.getDeviceId = function () {
  return this.id
}

Device.prototype.getConnectionString = function () {
  return this.cs
}

Device.prototype.setDeviceConnectionString = function (devcs) {
  this.devcs = devcs;
}

Device.prototype.getDevConnectionString = function () {
  return this.devcs;
}

Device.prototype.setAppliances = function (appl) {
  this.appliances = appl;
}

Device.prototype.getAppliances = function () {
  return this.appliances;
}

module.exports = Device;

