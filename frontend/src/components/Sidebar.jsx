export default function Sidebar({ allUsers, nearbyUsers, connectedUser, selfId }) {
  const online = allUsers.filter((u) => u.id !== selfId);
  const nearby = online.filter((u) => nearbyUsers.includes(u.id));
  const connected = connectedUser ? online.find((u) => u.id === connectedUser) : null;
  const others = online.filter((u) => u.id !== connectedUser && !nearbyUsers.includes(u.id));

  return (
    <div className="fixed top-5 left-5 z-20 w-[240px]">
      <div className="glass rounded-2xl overflow-hidden animate-fade-in"
           style={{ boxShadow: '0 0 40px rgba(0,0,0,0.3)' }}>

        {/* Header */}
        <div className="px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cosmos-success animate-pulse" />
            <span className="text-xs font-semibold text-cosmos-muted uppercase tracking-wider">
              Office — {online.length + 1} online
            </span>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {/* Connected section */}
          {connected && (
            <Section label="Connected" color="text-cosmos-accent">
              <UserRow user={connected} status="connected" />
            </Section>
          )}

          {/* Nearby section */}
          {nearby.length > 0 && (
            <Section label="Nearby" color="text-yellow-400">
              {nearby.map((u) => (
                <UserRow key={u.id} user={u} status="nearby" />
              ))}
            </Section>
          )}

          {/* All online */}
          {others.length > 0 && (
            <Section label="In Office" color="text-cosmos-muted">
              {others.map((u) => (
                <UserRow key={u.id} user={u} status="online" />
              ))}
            </Section>
          )}

          {online.length === 0 && (
            <div className="px-4 py-6 text-center text-cosmos-muted/40 text-xs">
              <span className="text-2xl block mb-2">🏢</span>
              No one else is here yet
            </div>
          )}
        </div>
      </div>

      {/* Controls tooltip */}
      <div className="mt-3 glass rounded-xl px-3 py-2.5 animate-fade-in">
        <div className="text-[10px] font-semibold text-cosmos-muted/60 uppercase tracking-wider mb-1.5">
          Controls
        </div>
        <div className="flex items-center gap-3 text-[11px] text-cosmos-muted">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-cosmos-bg border border-cosmos-border text-[9px] font-mono">W</kbd>
            <kbd className="px-1 py-0.5 rounded bg-cosmos-bg border border-cosmos-border text-[9px] font-mono">A</kbd>
            <kbd className="px-1 py-0.5 rounded bg-cosmos-bg border border-cosmos-border text-[9px] font-mono">S</kbd>
            <kbd className="px-1 py-0.5 rounded bg-cosmos-bg border border-cosmos-border text-[9px] font-mono">D</kbd>
          </span>
          <span className="text-cosmos-muted/40">to move</span>
        </div>
      </div>
    </div>
  );
}

function Section({ label, color, children }) {
  return (
    <div className="px-3 py-2">
      <div className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 px-1 ${color}`}>
        {label}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function UserRow({ user, status }) {
  const dotClass = {
    connected: 'bg-cosmos-accent shadow-[0_0_6px_rgba(99,102,241,0.6)]',
    nearby: 'bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.6)]',
    online: 'bg-cosmos-success shadow-[0_0_6px_rgba(16,185,129,0.6)]',
  }[status];

  return (
    <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/5
                    transition-colors duration-150 cursor-default group">
      <div className="relative flex-shrink-0">
        <img
          src={user.avatarUrl}
          alt=""
          className="w-7 h-7 rounded-full border border-cosmos-border group-hover:border-cosmos-accent/40
                     transition-colors duration-200"
          style={{ background: '#1e293b' }}
        />
        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-cosmos-card ${dotClass}`} />
      </div>
      <span className="text-xs font-medium text-cosmos-text truncate flex-1">
        {user.username}
      </span>
      {status === 'connected' && (
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cosmos-accent/15 text-cosmos-accent font-semibold">
          LINKED
        </span>
      )}
    </div>
  );
}
