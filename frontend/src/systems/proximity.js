// proximity.js — Distance-based proximity detection with state transitions

const NEARBY_THRESHOLD = 180;
const CONNECTED_THRESHOLD = 100;

export class ProximitySystem {
  constructor(onStateChange) {
    this.onStateChange = onStateChange;
    this.nearbyUsers = new Set();
    this.connectedUser = null;
  }

  update(localX, localY, remoteAvatars) {
    const newNearby = new Set();
    let closestId = null;
    let closestDist = Infinity;

    for (const [id, avatar] of remoteAvatars) {
      const dx = localX - avatar.container.x;
      const dy = localY - avatar.container.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < NEARBY_THRESHOLD) {
        newNearby.add(id);
        avatar.setNearby(true);

        if (dist < CONNECTED_THRESHOLD && dist < closestDist) {
          closestDist = dist;
          closestId = id;
        }
      } else {
        avatar.setNearby(false);
        avatar.setConnected(false);
      }
    }

    // Determine connected user (closest within threshold)
    const prevConnected = this.connectedUser;
    this.connectedUser = closestId;

    // Update connected state on avatars
    for (const [id, avatar] of remoteAvatars) {
      avatar.setConnected(id === closestId);
    }

    // Detect state changes
    const nearbyChanged = !setsEqual(this.nearbyUsers, newNearby);
    const connectedChanged = prevConnected !== this.connectedUser;

    if (nearbyChanged || connectedChanged) {
      this.nearbyUsers = newNearby;
      this.onStateChange({
        nearbyUsers: Array.from(newNearby),
        connectedUser: this.connectedUser,
        connectedChanged,
      });
    }

    return {
      nearbyUsers: newNearby,
      connectedUser: this.connectedUser,
    };
  }

  destroy() {
    this.nearbyUsers.clear();
    this.connectedUser = null;
  }
}

function setsEqual(a, b) {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
}
