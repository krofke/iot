#include <ESP8266WiFi.h>
#include "Adafruit_MQTT.h"
#include "Adafruit_MQTT_Client.h"
//#include "wifi.cpp"

#define AIO_SERVER      "iot.krofke.com.br"
#define AIO_SERVERPORT  8883
#define AIO_USERNAME    "acs2ddnv23"
#define AIO_KEY         "8K8O9Hf19d"

extern WiFiClientSecure client;

Adafruit_MQTT_Client mqtt(&client, AIO_SERVER, AIO_SERVERPORT, AIO_USERNAME, AIO_KEY);


/****************************** Feeds ***************************************/

// Setup a feed called 'test' for publishing.
// Notice MQTT paths for AIO follow the form: <username>/feeds/<feedname>
Adafruit_MQTT_Publish test = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/feeds/test");

void MQTT_connect() {
  int8_t ret;

  // Stop if already connected.
  if (mqtt.connected()) {
    return;
  }

  Serial.print("Connecting to MQTT... ");

  uint8_t retries = 3;
  while ((ret = mqtt.connect()) != 0) { // connect will return 0 for connected
       Serial.println(mqtt.connectErrorString(ret));
       Serial.println("Retrying MQTT connection in 5 seconds...");
       mqtt.disconnect();
       delay(5000);  // wait 5 seconds
       retries--;
       if (retries == 0) {
         // basically die and wait for WDT to reset me
         while (1);
       }
  }

  Serial.println("MQTT Connected!");
}

uint32_t x=0;

void MQTT() {
  MQTT_connect();

  // Now we can publish stuff!
  Serial.print(F("\nSending val "));
  Serial.print(x);
  Serial.print(F(" to test feed..."));
  if (! test.publish(x++)) {
    Serial.println(F("Failed"));
  } else {
    Serial.println(F("OK!"));
  }

  // wait a couple seconds to avoid rate limit
  delay(2000);

}


