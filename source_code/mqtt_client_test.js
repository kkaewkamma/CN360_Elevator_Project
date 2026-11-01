// CN360 Elevator MQTT Test Utility
// Demonstrates MQTT Publish & Subscribe with Mosquitto on tcp://127.0.0.1:1883
const mqtt = require('mqtt');

const BROKER = 'mqtt://127.0.0.1:1883';
console.log('Connecting to Mosquitto Broker at', BROKER, '...');
const client = mqtt.connect(BROKER);

client.on('connect', () => {
    console.log('CONNECTED TO MQTT BROKER (127.0.0.1:1883)');
    console.log('Subscribing to topics: elevator/#');

    client.subscribe('elevator/#', (err) => {
        if (err) {
            console.error('Subscription error:', err);
            return;
        }

        console.log('SUBSCRIBED: Listening to all elevator MQTT topics\n');

        // Test 1: Send Dispatch Request for Exam 3(b) (Floor 4 -> Floor 16, CARD_USER1)
        setTimeout(() => {
            const reqPayload = {
                from_floor: 4,
                target_floor: 16,
                card_id: "CARD_USER1"
            };
            const topic = 'elevator/hall/4/call_req';
            console.log(`[TEST 1] Publishing to '${topic}':`, reqPayload);
            client.publish(topic, JSON.stringify(reqPayload));
        }, 1000);
    });
});

client.on('message', (topic, message) => {
    try {
        const parsed = JSON.parse(message.toString());
        console.log(`--> [MQTT IN] Topic: ${topic}`);
        console.log('    Payload:', JSON.stringify(parsed, null, 2));

        if (topic.includes('assign')) {
            console.log('\nDISPATCH VERIFIED: Node-RED successfully evaluated and published assignment via MQTT!');
            console.log('Closing test in 2 seconds...');
            setTimeout(() => {
                client.end();
                process.exit(0);
            }, 2000);
        }
    } catch(e) {
        console.log(`--> [MQTT IN] Topic: ${topic} | Raw: ${message.toString()}`);
    }
});

client.on('error', (err) => {
    console.error('MQTT Client Error:', err.message);
});

