# Apache Kafka — Temperature Sensor Demo

> 🇧🇷 [Disponível também em Português (BR)](README.pt-BR.md)

A small end-to-end Apache Kafka demonstration built with **Docker Compose** and
**Node.js**. A simulated IoT producer publishes temperature readings to a Kafka
topic every second, a consumer reads them back, and a web UI lets you inspect
the whole pipeline in real time.

![Kafka UI — temperature_sensor_topic](img/temperature_sensor_topic.png)

## Architecture

| Service      | Image                                | Port | Description                                        |
|--------------|--------------------------------------|------|----------------------------------------------------|
| `zookeeper`  | `bitnamilegacy/zookeeper:3.9.3`      | 2181 | Cluster metadata and coordination (ZooKeeper mode) |
| `kafka`      | `bitnamilegacy/kafka:3.5.1`          | 9092 | The Kafka broker                                   |
| `kafka-ui`   | `kafbat/kafka-ui:latest`             | 8080 | Web UI for monitoring and managing the cluster     |
| `producer`   | Built from `producer/`               |  -   | Node.js app that publishes sensor readings         |
| `consumer`   | Built from `consumer/`               |  -   | Node.js app that consumes and prints them          |

Project layout:

```
.
├── docker-compose.yaml
├── producer/
│   ├── Dockerfile
│   ├── package.json
│   └── producer.js
├── consumer/
│   ├── Dockerfile
│   ├── package.json
│   └── consumer.js
└── img/
    └── temperature_sensor_topic.png
```

### How it works

- **`producer/producer.js`** generates simulated IoT sensor readings
  (`sensor_id`, `temperature`, `timestamp`) using [Faker](https://fakerjs.dev/),
  serializes them to JSON, and sends one message per second to the
  `temperature_sensor_topic` topic. The `sensor_id` is used as the message key,
  so readings from the same sensor land in the same partition.
- **`consumer/consumer.js`** joins the `temperature_sensor_consumer_group`
  consumer group, subscribes to the topic from the beginning
  (`fromBeginning: true`, the equivalent of `auto_offset_reset='earliest'`),
  deserializes each message, and prints it.

Both apps use [KafkaJS](https://kafka.js.org/) to talk to the broker over the
plaintext listener at `kafka:9092`.

## Getting started

Start the entire stack (broker, ZooKeeper, UI, producer, and consumer),
building the app images first:

```bash
docker compose up --build
```

Add `-d` to run it in the background. Once everything is up, you should see the
consumer printing messages like:

```
Received: { sensor_id: '17', temperature: 23.41, timestamp: '2026-10-23T20:35:59.315Z' }
```

## Kafka UI

The cluster can be monitored through **Kafka UI**, available at
**http://localhost:8080**.

From there you can:

- Browse the cluster (`BRDataSUS`), brokers, and consumer groups.
- Inspect the `temperature_sensor_topic` topic: its **3 partitions**, message
  keys, payloads, offsets, and throughput.
- **Produce** messages manually and **consume** them from the browser.
- Watch lag for the `temperature_sensor_consumer_group` in real time.

## Commands explained

### `docker compose up --build`

Starts every service defined in `docker-compose.yaml` and **builds the app
images before starting them**. The `--build` flag matters: the Dockerfiles
`COPY` the source files into the image, so after changing `producer.js`,
`consumer.js`, or a `package.json`, the images must be rebuilt for the changes
to take effect — without `--build`, Compose would reuse the stale image from a
previous build.

### `docker compose down`

**Stops and removes** all containers created by `up`, along with the default
network. The Kafka and ZooKeeper data written inside the containers is stored
in the containers' writable layers (this project defines no named volumes), so
`down` also discards that state — the next `up` starts from a clean, empty
cluster. Use `docker compose stop` instead if you only want to pause the
services while keeping their data.

### `docker ps`

Lists the **currently running containers** with their status, and is the
quickest way to check whether the stack is healthy — e.g. whether `kafka`,
`producer`, and `consumer` are `Up` or have exited with an error code. Add
`-a` (`docker ps -a`) to also include stopped and crashed containers.

### `docker logs -f producer`

Shows the **log output of the `producer` container** and follows it live
(`-f` = follow), streaming new lines as they are produced. Here you see each
generated sensor reading as the producer publishes it — useful to confirm that
messages are being sent and to spot connection errors or crashes.

### `docker logs -f consumer`

Same as above, but for the **`consumer` container**: it follows the logs so
you can watch each message arriving from the topic in real time. This is the
simplest end-to-end verification — if `producer` logs show publishes and
`consumer` logs show matching `Received:` lines, the whole pipeline is working.

> Tip: `Ctrl+C` stops following the logs; it does not stop the containers.

## Typical workflow

```bash
# Build and start everything
docker compose up --build

# Check the containers are running (in another terminal)
docker ps

# Watch each side of the pipeline
docker logs -f producer
docker logs -f consumer

# Explore the topic, partitions, and messages in the browser
open http://localhost:8080

# Stop and clean up
docker compose down
```

## License

This project is licensed under the **GNU General Public License Version 3
(GPL)**. See the [LICENSE](https://github.com/fmarqueseti/apache-kafka?tab=GPL-3.0-1-ov-file) file for details.
