const logger = log('catdoor');

/** schedule change to cat door position */
rules.JSRule({
  name: "Schedule updated catdoor positions",
  description: "",
  triggers: [
    triggers.GenericCronTrigger("0 0 * * * ?"), // run every hour. ensures it gets set even if device is rebooting at action time
  ],
  tags: [],
  id: "Catdoor_ScheduleChange",
  execute: (event) => {
    var now = time.ZonedDateTime.now();
    logger.info(`Got trigger to schedule catdoor position change ${now.hour()}`);

    if(now.hour() >= 19) {
      logger.info("Setting catdoor to IN ONLY on schedule");
      items.getItem('Catdoor_Position_Text').sendCommand('in only');
    } else if(now.hour() >= 6) {
      logger.info("Setting catdoor to OPEN on schedule");
      items.getItem('Catdoor_Position_Text').sendCommand('open');
    }
  }
});

/** New MQTT Generic thing method */
rules.JSRule({
  name: "Manage changes in catdoor [prod] state from UI or rules",
  description: "",
  triggers: [
    triggers.ItemStateChangeTrigger("Catdoor_Position_Text", undefined)
  ],
  tags: [],
  id: "Catdoor_Battery_Prod_MoveCatdoor",
  execute: (event) => {
    // allowed positions
    // open, in only, closed
    logger.info(`Received catdoor change to: ${event.newState}`);
    const newState = event.newState;
    let newPosition = null;

    switch(newState) {
      case "open" :
        newPosition = -100;
        break;
      case 'in only' :
        newPosition = 100;
        break;
      case 'closed' :
        newPosition = 55;
        break;      
    }

    if(newPosition !== null) {
      logger.info(`Sending message to update Cat door [prod] to position: ${newPosition}`);
      var catdoor_mqtt_item = items.getItem("Catdoor_Position_Number");
      catdoor_mqtt_item.sendCommand(newPosition);
    }
  }
});