#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <ESP8266HTTPClient.h>

#define jwt "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NDEyNzEwMDQsIm5iZiI6MTYxMTI3MDk0NCwiaXNzIjoiaHR0cHM6Ly9pb3Qua3JvZmtlLmNvbS5iciIsInJvbGVzIjpbImRldmljZSJdLCJuYW1lIjoiYWRtaW4iLCJpYXQiOjE2MTEyNzEwMDR9.EcgSKU1QNNcSLHN6BEvtpkeGsXojdi4o2SuD9HrTNWek0X8SUeCGmInD7ge-SzowEshDj9oiaoroQcPOyUd2IwEU_dB4CgiDWzRlS2lXWv4XRYrpcV83krfrZ7dA2zlcEy0XtSwEp0WRBa6O3S6wBhistLF4zH9LGTD7lwv5OqskqfU5mM0reYM2CnOdyLcfnKCQVs5aLLNyAfXJMOmUIWv3TRiZnA8gJ5rX_sGBzWwJVCjLXMP8rgjs3RyZ93k2giFyiFLWvjZ49bRNBXD2DIzkZG5vzvf6eTsNrOHmTeifwIB6_Q_v1R_F3U_2DYghKwz9fSxFsbIEzNyfzMnRlw"

const char* ssid     = "Hamburger";     // your network SSID (name of wifi network)
const char* password = "z9NpDjzHdj"; // your network password
const char* host = "iot.krofke.com.br";
const int httpsPort = 443;

const char trustRoot[] PROGMEM = R"EOF(
-----BEGIN CERTIFICATE-----
MIIDSjCCAjKgAwIBAgIQRK+wgNajJ7qJMDmGLvhAazANBgkqhkiG9w0BAQUFADA/
MSQwIgYDVQQKExtEaWdpdGFsIFNpZ25hdHVyZSBUcnVzdCBDby4xFzAVBgNVBAMT
DkRTVCBSb290IENBIFgzMB4XDTAwMDkzMDIxMTIxOVoXDTIxMDkzMDE0MDExNVow
PzEkMCIGA1UEChMbRGlnaXRhbCBTaWduYXR1cmUgVHJ1c3QgQ28uMRcwFQYDVQQD
Ew5EU1QgUm9vdCBDQSBYMzCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEB
AN+v6ZdQCINXtMxiZfaQguzH0yxrMMpb7NnDfcdAwRgUi+DoM3ZJKuM/IUmTrE4O
rz5Iy2Xu/NMhD2XSKtkyj4zl93ewEnu1lcCJo6m67XMuegwGMoOifooUMM0RoOEq
OLl5CjH9UL2AZd+3UWODyOKIYepLYYHsUmu5ouJLGiifSKOeDNoJjj4XLh7dIN9b
xiqKqy69cK3FCxolkHRyxXtqqzTWMIn/5WgTe1QLyNau7Fqckh49ZLOMxt+/yUFw
7BZy1SbsOFU5Q9D8/RhcQPGX69Wam40dutolucbY38EVAjqr2m7xPi71XAicPNaD
aeQQmxkqtilX4+U9m5/wAl0CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAOBgNV
HQ8BAf8EBAMCAQYwHQYDVR0OBBYEFMSnsaR7LHH62+FLkHX/xBVghYkQMA0GCSqG
SIb3DQEBBQUAA4IBAQCjGiybFwBcqR7uKGY3Or+Dxz9LwwmglSBd49lZRNI+DT69
ikugdB/OEIKcdBodfpga3csTS7MgROSR6cz8faXbauX+5v3gTt23ADq1cEmv8uXr
AvHRAosZy5Q6XkjEGB5YGV8eAlrwDPGxrancWYaLbumR9YbK+rlmM6pZW87ipxZz
R8srzJmwN0jP41ZL9c8PDHIyh8bwRLtTcm1D9SZImlJnt1ir/md2cXjbDaJWFBM5
JDGFoqgCWjBH4d1QB7wCCZAA62RjYJsWvIjJEubSfZGL+T0yjWW06XyxV3bqxbYo
Ob8VZRzI9neWagqNdwvYkQsEjgfbKbYK7p2CNTUQ
-----END CERTIFICATE-----
)EOF";
X509List cert(trustRoot);


WiFiClientSecure client;

void WifiSetup(){
    Serial.println();
    Serial.print("Connecting to ");
    Serial.println(ssid);
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("");
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());

    // Set time via NTP, as required for x.509 validation
    configTime(3 * 3600, 0, "b.st1.ntp.br", "c.st1.ntp.br");

    Serial.print("Waiting for NTP time sync: ");
    time_t now = time(nullptr);
    while (now < 8 * 3600 * 2) {
        delay(500);
        Serial.print(".");
        now = time(nullptr);
    }
    Serial.println("");
    struct tm timeinfo;
    gmtime_r(&now, &timeinfo);
    Serial.print("Current time: ");
    Serial.print(asctime(&timeinfo));
    Serial.printf("Using certificate: %s\n", trustRoot);
    client.setTrustAnchors(&cert);
}



void connect(){
  
  if (!client.connect(host, httpsPort)) {
    Serial.println("Connection failed");
    return;
  }
  String url = "/";
  Serial.print("Requesting URL: ");

  client.print(String("GET ") + url + " HTTP/1.1\r\n" +
               "Host: " + host + "\r\n" +
               "User-Agent: BuildFailureDetectorESP8266\r\n" +
               "Connection: close\r\n\r\n");

  Serial.println("Request sent");
  while (client.connected()) {
    String line = client.readString();
    if (line == "\r") {
      Serial.println("Headers received");
      break;
    }
  }
  String line = client.readStringUntil('\n');

  Serial.println("Reply was:");
  Serial.println("==========");
  Serial.println(line);
  Serial.println("==========");
  Serial.println("Closing connection");
  
}


void WifiCheck(){

}


void KiotRegister(String device, String type, String version){
  Serial.println("Registrando dispositivo");

  if (!client.connect(host, httpsPort)) {
    Serial.println("Connection failed");
    return;
  }

  String url = "/device/register?device=" + device +"&type=" + type + "&version=" + version;

  client.print(String("GET ") + url + " HTTP/1.1\r\n" +
               "Host: " + host + "\r\n" +
               "Authorization: " + jwt + "\r\n" +
               "User-Agent: ESP8266\r\n" +
               "Connection: close\r\n\r\n");

  while (client.connected()) {
    String line = client.readStringUntil('\n');
    if (line == "\r") {
      break;
    }
  }
  Serial.println("Dispositivo registrado");
}