import 'dotenv/config';
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
const portName=process.env.SERIAL_PORT;
if(!portName)throw new Error('Define SERIAL_PORT (ej. COM3) en el .env del puente local.');
const apiUrl=(process.env.API_URL||'http://localhost:8080/api/v1').replace(/\/$/,'');
const map={A:Number(process.env.SENSOR_ID_A||1),B:Number(process.env.SENSOR_ID_B||2)};
const port=new SerialPort({path:portName,baudRate:Number(process.env.SERIAL_BAUD||9600)});
const parser=port.pipe(new ReadlineParser({delimiter:'\r\n'}));
parser.on('data',async line=>{
  const [zone,cm,presence]=line.trim().split(',');if(!['A','B'].includes(zone)||presence==null)return;
  const distance=Number(cm);try{const r=await fetch(`${apiUrl}/telemetry/ingest`,{method:'POST',headers:{'Content-Type':'application/json','X-Device-Key':process.env.DEVICE_API_KEY},body:JSON.stringify({sensorId:map[zone],distanceCm:Number.isFinite(distance)&&distance>=0?distance:null,vehiclePresent:presence==='1',source:'arduino-uno-usb'})});if(!r.ok)console.error('API rechazó telemetría:',r.status,await r.text());}
  catch(e){console.error('No se pudo enviar la lectura:',e.message)}
});
port.on('open',()=>console.log(`Puente serial conectado: ${portName} → ${apiUrl}`));
port.on('error',e=>console.error('Error serial:',e.message));
