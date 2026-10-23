const { Kafka } = require('kafkajs');
const { faker } = require('@faker-js/faker');

const kafka = new Kafka({
  clientId: 'producer',
  brokers: ['kafka:9092'],
});

const producer = kafka.producer();
const topic = 'temperature_sensor_topic';

// Generates simulated IoT sensor readings
function generateTemperatureData() {
  return {
    sensor_id: String(faker.number.int({ min: 1, max: 50 })), // Unique ID for the sensor
    temperature: Number(faker.number.float({ min: -10, max: 40, fractionDigits: 2 })), // Random temperature between -10ºC and 40ºC
    timestamp: new Date().toISOString(), // Timestamp of the reading
  };
}

async function main() {
  await producer.connect();

  while (true) {
    const data = generateTemperatureData();
    console.log(data); // Educational purposes only
    await producer.send({
      topic,
      messages: [{ key: data.sensor_id, value: JSON.stringify(data) }], // Send both the key and the value
    });
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Send a message every second
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
