#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <WiFiClientSecureBearSSL.h>
#include <Wire.h>
#include <WiFiUdp.h>
#include <ArduinoOTA.h>
#include <WiFiClient.h>
#include <ESP8266HTTPClient.h>
#include "Button2.h"
#include <EEPROM.h>
#include <ArduinoJson.h>

ESP8266WiFiMulti WiFiMulti;
const char* host = "https://us-central1-sitio-alvorada.cloudfunctions.net/iotLog";

#define DEVICE_NAME "bomba2"
#define DEV false

#define RELAY_PIN  D1
#define PIN_BOIA  D2
#define PIN_LED1  D5
#define PIN_LED2  D6
#define BUTTON_PIN  D7


const char* ssid = "Arly_WiFi";

Button2 button = Button2(BUTTON_PIN);

int modo = 0;// 0 automatico, 1 ligado, 2 deligado
int modoLed = 99;
unsigned long ultimoTempo;
unsigned long tempoLigado = 1000 * 60 * 3;
//unsigned long minTempoLigado = 1000 * 30 ;

unsigned long tempoAlteracaoRelay = 1000 * 20 ;
unsigned long ultimoTempoAlteracaoRelay = millis();



unsigned long tempoDesligadoDepoisDeCheio = 1000 * 60 * 120;
unsigned long tempoDesligadoDepoisVazio = 1000 * 60 * 20;
unsigned long tempoDesligado = tempoDesligadoDepoisVazio;


unsigned long ultimoTempoNotificar = millis();
unsigned long tempoNotificar = 1000 * 180; //todo minuto minuto

int boia = LOW;
int statusRelay = LOW;
int novoStatusRelay = LOW;

HTTPClient http;

void ledHandler(){
  if (modoLed != modo ){
    modoLed = modo;
    if (modoLed == 0 && statusRelay == LOW){
      Serial.println("Automatico - Desligado");
      digitalWrite(PIN_LED1, HIGH);
      digitalWrite(PIN_LED2, LOW);
    }else if (modoLed == 0 && statusRelay == HIGH){
      Serial.println("Automatico - Ligado");
      digitalWrite(PIN_LED1, HIGH);
      digitalWrite(PIN_LED2, HIGH);

    }else if (modoLed == 1){
      Serial.println("Manual - Ligado");
      digitalWrite(PIN_LED1, LOW);  
      digitalWrite(PIN_LED2, HIGH);
      novoStatusRelay = HIGH;
    }else if (modoLed == 2){
      Serial.println("Manual - Desligado");
      digitalWrite(PIN_LED1, LOW);  
      digitalWrite(PIN_LED2, LOW);
      novoStatusRelay = LOW;
    }
  }

}
void handler(Button2& btn) {
  Serial.println("Alterando modo");
  modo++;
  modoLed = 99;
  if (modo > 2){
    modo = 0;
  }
  EEPROM.write(0, modo);
  EEPROM.commit();
}


void setup() {

  EEPROM.begin(8);

  Serial.begin(115200);

  Serial.printf("\n\n\n");
  Serial.println("Booting");
  
  Serial.println(EEPROM.read(0));
  if (EEPROM.read(0) < 4){
    modo = EEPROM.read(0);
  }else{
    modo = 0;
  }

  WiFi.hostname(DEVICE_NAME);
  WiFi.mode(WIFI_STA);
  Serial.print("Conectando na rede: ");
  Serial.println(ssid);
  WiFiMulti.addAP(ssid);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println(WiFi.localIP());

  // No authentication by default
  // ArduinoOTA.setPassword("admin");

  ArduinoOTA.onStart([]() {
    String type;
    if (ArduinoOTA.getCommand() == U_FLASH)
      type = "sketch";
    else // U_SPIFFS
      type = "filesystem";

    // NOTE: if updating SPIFFS this would be the place to unmount SPIFFS using SPIFFS.end()
    Serial.println("Start updating " + type);
  });
  ArduinoOTA.onEnd([]() {
    Serial.println("\nEnd");
  });
  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    Serial.printf("Progress: %u%%\r", (progress / (total / 100)));
  });
  ArduinoOTA.onError([](ota_error_t error) {
    Serial.printf("Error[%u]: ", error);
    if (error == OTA_AUTH_ERROR) Serial.println("Auth Failed");
    else if (error == OTA_BEGIN_ERROR) Serial.println("Begin Failed");
    else if (error == OTA_CONNECT_ERROR) Serial.println("Connect Failed");
    else if (error == OTA_RECEIVE_ERROR) Serial.println("Receive Failed");
    else if (error == OTA_END_ERROR) Serial.println("End Failed");
  });
  ArduinoOTA.begin();
  Serial.println("Ready OTA ESP8266");

  pinMode(RELAY_PIN, OUTPUT);
  pinMode(PIN_LED1, OUTPUT);
  pinMode(PIN_LED2, OUTPUT);
  pinMode(PIN_BOIA, INPUT);
  
  digitalWrite(RELAY_PIN, LOW);
  digitalWrite(PIN_LED1, LOW);
  digitalWrite(PIN_LED2, LOW);
  
  button.setClickHandler(handler);
  button.setLongClickHandler(handler);
  button.setDoubleClickHandler(handler);
  button.setTripleClickHandler(handler);
  http.setTimeout(500);
}

void logger(String msg){
  int str_len = msg.length() + 1; 
  char char_array[str_len];
  msg.toCharArray(char_array, str_len);
  Serial.println(char_array);

  WiFiClientSecure client;
  client.setInsecure();
  client.connect(host, 443);
  if ( http.begin(client, host) ){
    Serial.println("http.ok");
  }
  http.addHeader("Content-Type","application/json");
  http.POST(char_array);
  Serial.println(http.getString());


  DynamicJsonDocument doc(1024);
  deserializeJson(doc, http.getString() );
  int novoModo = doc["doc"]["novoModo"];
  if (novoModo != -1){
    Serial.println("Alterando modo (remoto)");
    modo = novoModo;
    modoLed = 99;
    EEPROM.write(0, modo);
    EEPROM.commit();    
  }  
  http.end();
}
void iotLogger(){
    StaticJsonDocument<200> doc;
    doc["device"] = DEVICE_NAME;

    doc["status-boia"] = boia == LOW ? "BAIXO" :  "ALTO";
    doc["modo"] = modo;

    if (statusRelay == HIGH){
      doc["status-relay"] = "LIGADO";
      doc["tempo"] = ( ( millis() - ultimoTempo ) / 1000); 
    }else{
      doc["status-relay"] = "DELIGADO";
      doc["tempo"] = ( ( tempoDesligado - ( millis() - ultimoTempo) ) / 1000 );    
    } 
    
    String msg = "";
    serializeJson(doc, msg);
    logger(msg);
}

void handleSensor(){
  if (!DEV && boia != digitalRead( PIN_BOIA ) ){
      boia = digitalRead( PIN_BOIA );
      if (boia == HIGH){
        tempoDesligado = tempoDesligadoDepoisDeCheio;
      }
  }  
}

void handleRelay(){
  if (boia == HIGH && statusRelay == HIGH){
      novoStatusRelay = LOW;
  }
  if (novoStatusRelay != statusRelay &&
        (millis() - ultimoTempoAlteracaoRelay) > tempoAlteracaoRelay ){
      
      modoLed = 99;
      
      
      if (boia == HIGH){
        tempoDesligado = tempoDesligadoDepoisDeCheio;

        //notificar caixa cheia
        iotLogger();
      }else{        
        tempoDesligado = tempoDesligadoDepoisVazio;
      }

      statusRelay = novoStatusRelay;
      digitalWrite(RELAY_PIN, statusRelay);
      
      ultimoTempo = millis();
      ultimoTempoAlteracaoRelay = millis();
      
      if (statusRelay == LOW){
        Serial.println("desligando");
      }else{
        Serial.println("ligando");
      }
  }
}
void loop() {
  ArduinoOTA.handle();
  button.loop();
  ledHandler();


  if (statusRelay == LOW) {
    if (ultimoTempo == 0 || ( millis() - ultimoTempo ) > tempoDesligado  ){
      ultimoTempo = millis();
      novoStatusRelay = HIGH;
    }
  }else{
    if ( ( millis() - ultimoTempo ) > tempoLigado  ){
      ultimoTempo = millis();
      novoStatusRelay = LOW;
    }
  }

  handleSensor();
  handleRelay();

  if (( millis() - ultimoTempoNotificar ) > tempoNotificar  ){
    
      //verifica wifi
     WiFiMulti.run(3000);
     ultimoTempoNotificar = millis();

    iotLogger();
 } 

  //depois de +-50 dias reseta
  if (millis() < ultimoTempo ){
    ultimoTempo = millis();
  }
  if (DEV){
   delay(1000);
  }else{
   delay(10); 
  }
  
}