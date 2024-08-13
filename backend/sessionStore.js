/* abstract */ class SessionStore {
  findSession(id) {}
  saveSession(id, session) {}
  findAllSessions() {}
}

class InMemorySessionStore extends SessionStore {
  constructor() {
    super();
    this.sessions = {}; // Use a plain object (dictionary) instead of a Map
  }

  findSession(id) {
    return this.sessions[id]; // Access the session using the key
  }

  saveSession(id, session) {
    console.log('session saved');
    this.sessions[id] = session; // Save the session in the dictionary
    const foundSession = this.findSession(id);
    console.log(`The session I found after saving: ${JSON.stringify(foundSession)}`);
  }

  findAllSessions() {
    return Object.values(this.sessions); // Use Object.values() to get all sessions
  }
}

module.exports = new InMemorySessionStore()