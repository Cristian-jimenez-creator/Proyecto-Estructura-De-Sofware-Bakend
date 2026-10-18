// Maqueta de demostración con Arduino UNO, 2 HC-SR04 y 6 LEDs con resistencias.
// Pines: A trig/echo 2/3; B trig/echo 4/5; A rojo/amarillo/verde 6/7/8;
// B rojo/amarillo/verde 9/10/11. Cada LED necesita su resistencia (220-330 ohm).
// Ajusta estos pines al cableado real antes de conectar la placa.
const byte trigA=2, echoA=3, trigB=4, echoB=5;
const byte ledsA[]={6,7,8}, ledsB[]={9,10,11}; // R, Y, G
const float DETECT_CM=35.0;
const unsigned long MIN_GREEN_MS=5000, YELLOW_MS=1200, ALL_RED_MS=400;
char green='A'; unsigned long greenSince=0;
float readCm(byte trig, byte echo){
  digitalWrite(trig,LOW); delayMicroseconds(3); digitalWrite(trig,HIGH); delayMicroseconds(10); digitalWrite(trig,LOW);
  unsigned long us=pulseIn(echo,HIGH,25000UL); if(!us)return -1;
  return us*0.0343f/2.0f;
}
void setLights(char direction, byte phase){ // phase 0 rojo, 1 amarillo, 2 verde
  for(byte i=0;i<3;i++){digitalWrite(ledsA[i],LOW);digitalWrite(ledsB[i],LOW);}
  if(direction=='A')digitalWrite(ledsA[phase],HIGH);else digitalWrite(ledsB[phase],HIGH);
  digitalWrite(ledsA[0],direction=='A'?LOW:HIGH);digitalWrite(ledsB[0],direction=='B'?LOW:HIGH);
}
void switchTo(char next){
  setLights(green,1); delay(YELLOW_MS);
  digitalWrite(ledsA[0],HIGH);digitalWrite(ledsA[1],LOW);digitalWrite(ledsA[2],LOW);
  digitalWrite(ledsB[0],HIGH);digitalWrite(ledsB[1],LOW);digitalWrite(ledsB[2],LOW);
  delay(ALL_RED_MS); green=next;setLights(green,2);greenSince=millis();
}
void setup(){Serial.begin(9600);pinMode(trigA,OUTPUT);pinMode(echoA,INPUT);pinMode(trigB,OUTPUT);pinMode(echoB,INPUT);
  for(byte i=0;i<3;i++){pinMode(ledsA[i],OUTPUT);pinMode(ledsB[i],OUTPUT);}greenSince=millis();setLights('A',2);}
void loop(){
  float a=readCm(trigA,echoA);delay(50);float b=readCm(trigB,echoB);
  bool carA=a>0&&a<=DETECT_CM,carB=b>0&&b<=DETECT_CM;
  if(millis()-greenSince>=MIN_GREEN_MS&&carA!=carB){char wanted=carA?'A':'B';if(wanted!=green)switchTo(wanted);}
  // Protocolo serial para scripts/serial-bridge.js: VIA,distance_cm,vehicle_present
  Serial.print("A,");Serial.print(a,1);Serial.print(",");Serial.println(carA?1:0);
  Serial.print("B,");Serial.print(b,1);Serial.print(",");Serial.println(carB?1:0);
  delay(500);
}
