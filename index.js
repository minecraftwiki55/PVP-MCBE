const bedrock = require('bedrock-protocol');

const client = bedrock.createClient({
  host: 'minecraftwiki11.aternos.me',
  port: 47379,
  username: 'PvPBot',
  offline: true
});

let targetPlayer = null;
const attackRange = 3;

client.on('connect', () => {
  console.log('Connected to the server successfully!');
});

client.on('error', (err) => {
  console.error('Error occurred:', err);
});

client.on('player_list', (packet) => {
  console.log('Updated player list:', packet.records.map(p => p.username));
});

client.on('move_entity', (packet) => {});

client.on('move_player', (packet) => {
  if (packet.runtime_entity_id === client.entityId) return;

  const distance = calculateDistance(client.position, packet.position);

  if (distance <= attackRange) {
    targetPlayer = {
      entityId: packet.runtime_entity_id,
      position: packet.position,
      username: getUsernameFromEntityId(packet.runtime_entity_id)
    };
    console.log(`Nearby player detected: ${targetPlayer.username}`);
    attackPlayer(targetPlayer);
  } else if (targetPlayer && targetPlayer.entityId === packet.runtime_entity_id) {
    targetPlayer = null;
  }
});

function calculateDistance(pos1, pos2) {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  const dz = pos1.z - pos2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function getUsernameFromEntityId(entityId) {
  return 'UnknownPlayer';
}

function attackPlayer(player) {
  console.log(`Attacking ${player.username}...`);

  client.queue('interact', {
    action: 1,
    target_entity_id: player.entityId,
    position: player.position
  });

  setTimeout(() => {
    if (targetPlayer && targetPlayer.entityId === player.entityId) {
      attackPlayer(player);
    }
  }, 500);
}