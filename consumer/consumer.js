const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'consumer',
  brokers: ['kafka:9092'],
});

const consumer = kafka.consumer({ groupId: 'temperature_sensor_consumer_group' });
const topic = 'temperature_sensor_topic';

async function main() {
  await consumer.connect();

  // fromBeginning: true is the equivalent of auto_offset_reset='earliest'
  await consumer.subscribe({ topic, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const value = message.value ? JSON.parse(message.value.toString()) : null;
      console.log('Received:', value);
    },
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
