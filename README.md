
You will develop:
 * A simulated Smart Meter sensor
 * A device management agent tool
 * Hot path data analysis with a real-time dashboard 

### System Architecture

![alt text](https://github.com/lucarv/smartmetersim/blob/master/img/smartmeterlab.png "architecture")

### Language choice
You will be writing code, but the choice of language is yours.
  * C
  * Python
  * Node.js
  * Java
  * .NET

This repo contains a finalized version of the smart meter simulator based written in node.js

*[Agent Console Example](http://github.com/lucarv/agentconsole)*

We will be using the [Azure IoT Hub SDK](https://github.com/Azure/azure-iot-sdks)'s to simplify development

### Smart Meter simulator
1.  Create an IoT Hub instance and explore the different connection strings

    *There are multiple ways to create Azure resources, but the [Azure portal](https://portal.azure.com/) is the easiest to use. [How to create an Azure IoT Hub](https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-create-through-portal)*

2. Create an app that asks for a connection string, a device identity and register the device to the IoT Hub

    *[Getting started](https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-csharp-csharp-getstarted)*

3. Send power meter reading to the IoT Hub every minute based on a list of appliances and their consumption

    Use JSON format like below for the message to be sent to IoT Hub:

    ```json
    {
        deviceId: "myDeviceId",
        powerConsumption: 34.6
    }
    ```

4. Explore the concept of device twins, direct methods and reporting of properties. Create a direct method that will block the device. this should not stop the messages but should show on the device simulator that the device is blocked. also the messaging frequency should go down to one message every 10 minutes

    *[How-to use device twins](https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-csharp-node-twin-getstarted) and [Direct Methods tutorial](https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-csharp-node-direct-methods)*

5. Create one or two properties (such as device firmware version and installed location) and report them using device twins functionality.

### Device management agent

1. Create an app where the agent can enter a device and a connection string and get access to the device properties as reported in task 5 above

2. Create a direct method that invokes the device blocking

3. Enter desired properties 

4. Query they Azure IoT Hub to find all devices with out of date firmware. (time allowing we could go into management jobs and create a job to set all devices in a location and firmware number to upgrade to a new version)

    *[Scheduling jobs](https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-csharp-node-schedule-jobs)*

### Cloud Applications

1. Understand Stream Analytics and Azure Storage. Create a job that reads all telemetry messages and save them to an Azure Storage blob

    *[Creating a Stream Analytics job]({)https://docs.microsoft.com/en-us/azure/stream-analytics/stream-analytics-get-started-with-azure-stream-analytics-to-process-data-from-iot-devices)*

    Stream Analytics has powerful functionality such as time-series querying with [Window Functions](https://docs.microsoft.com/en-us/azure/stream-analytics/stream-analytics-window-functions) - take a look at some of the [common query patterns](https://docs.microsoft.com/en-us/azure/stream-analytics/stream-analytics-stream-analytics-query-patterns).

3. Explore [Power BI](http://powerbi.com). Create a dashboard showing status of devices per location or devices that are blocked (I have no idea on how Power BI work, so if this sounds absurd we can do something different)

    *[How-to visualize real-time data in Power BI](https://docs.microsoft.com/en-us/azure/stream-analytics/stream-analytics-power-bi-dashboard)*

3. Automatically disconnect a device if the power consumption is to high. Use Azure Functions to send message to the Smart Meter via IoT Hub.

    *[How-to create an Azure Function](https://docs.microsoft.com/en-us/azure/azure-functions/functions-create-first-azure-function)*
