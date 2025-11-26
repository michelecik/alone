import React, { useEffect, useRef, useState } from "react";
import MapCanvas from "./components/MapCanvas";
import './App.css'
const WS_URL = (import.meta.env.VITE_WS_URL) || "ws://localhost:8080";

export default function App() {
  const [connected, setConnected] = useState(false);
  const [player, setPlayer] = useState(null);
  const [tile, setTile] = useState(null);
  const [map, setMap] = useState(null);
  const [legend, setLegend] = useState(null);
  const [events, setEvents] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [wsState, setWsState] = useState(null);
  const socketRef = useRef(null);
  const audioRefs = useRef({});

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    socketRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      // register as dashboard
      ws.send(JSON.stringify({ type: "register", client: "dashboard" }));
      setEvents(e => ["Connected to server", ...e].slice(0, 50));
    };

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);

        handleMessage(data);
      } catch (err) {
        // if server sends plain text, append
        setEvents(e => [evt.data, ...e].slice(0, 50));
      }
    };

    ws.onclose = () => {
      setConnected(false);
      setEvents(e => ["Disconnected from server", ...e].slice(0, 50));
    };

    ws.onerror = (err) => {
      console.error("WS error", err);
      setWsState(err);
    };

    return () => {
      ws.close();
    };
  }, []);

  function handleMessage(data) {
    switch (data.type) {
      case "welcome":
        setPlayer(data.player || null);
        setEvents(e => [data.message || "Welcome", ...e].slice(0, 50));
        break;

      case "update":
        setPlayer(data.player || null);
        
        setTile(data.tile || null);
        setEvents(e => [data.event || `Moved to ${data.player?.x},${data.player?.y}`, ...e].slice(0, 50));
        break;

      case "status":
        setPlayer(prev => ({ ...prev, ...(data.pos || {}), hp: data.hp ?? prev?.hp, stamina: data.stamina ?? prev?.stamina }));
        break;

      case "map":
        setMap(data || null);
        break;

      case "legend":
        setLegend(data.legend || null);
        break;

      case "loot":
        setEvents(e => [data.message, ...e].slice(0, 50));
        break;

      case "inventory":
        setInventory(Array.isArray(data.inventory) ? data.inventory : (data.message ? data.message.split("\n") : []));
        break;

      case "event":
        setEvents(e => [data.message, ...e].slice(0, 50));
        break;

      case "sound":
        playSound(data.name);
        break;

      case "combat_start":
      case "combat_update":
      case "combat_end":
        setEvents(e => [data.message, ...e].slice(0, 200));
        // optional: play sound on combat start
        if (data.type === "combat_start") playSound("combat");
        break;

      default:
        // generic fallback
        if (data.message) setEvents(e => [data.message, ...e].slice(0, 200));
        break;
    }
  }

  function sendCommand(cmd) {
    const ws = socketRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      setEvents(e => ["Cannot send, socket closed", ...e].slice(0, 50));
      return;
    }
    ws.send(cmd);
  }

  // audio management
  function playSound(name) {
    if (!name) return;
    // preload basic sounds map
    const sounds = {
      loot: "/sounds/loot.mp3",
      hurt: "/sounds/hurt.mp3",
      combat: "/sounds/combat.mp3",
      ambient: "/sounds/ambient.mp3"
    };
    const url = sounds[name] || sounds.loot;
    if (!audioRefs.current[url]) {
      const a = new Audio(url);
      audioRefs.current[url] = a;
    }
    const audio = audioRefs.current[url];
    audio.currentTime = 0;
    audio.play().catch(err => {
      // autoplay policies might block, show log
      setEvents(e => ["Audio blocked by browser (user gesture needed).", ...e].slice(0, 50));
    });
  }

  // UI helpers
  const miniMap = () => {
    if (!map) return <div className="text-sm whitespace-pre font-mono">(map not loaded)</div>;
    return <pre className="text-sm whitespace-pre font-mono">{map}</pre>;
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-900 text-zinc-100">
      <header className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-xl font-semibold">Agartha Dashboard</div>
          <div className="text-sm text-zinc-400">WS: {WS_URL}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded ${connected ? 'bg-green-700' : 'bg-red-700'}`}>{connected ? 'Connected' : 'Disconnected'}</div>
          <button className="bg-zinc-800 px-3 py-1 rounded" onClick={() => sendCommand(JSON.stringify({ type: 'register', client: 'dashboard' }))}>Re-register</button>
        </div>
      </header>

      <main className="flex-1 p-4 grid grid-cols-3 gap-4">
        <section className="col-span-1 bg-zinc-800 p-4 rounded shadow-sm flex flex-col gap-3">
          <h3 className="font-semibold">Player</h3>
          <div className="text-sm">
            <div>Id: <span className="text-zinc-300">{player?.id ?? '-'}</span></div>
            <div>Pos: <span className="text-zinc-300">{player ? `${player.x}, ${player.y}` : '-'}</span></div>
            <div>HP: <span className="text-zinc-300">{player?.hp ?? '-'}</span></div>
            <div>Stamina: <span className="text-zinc-300">{player?.stamina ?? '-'}</span></div>
            <div>{JSON.stringify(player)}</div>
          </div>

          <div className="mt-2">
            <button className="bg-emerald-600 px-3 py-1 rounded mr-2" onClick={() => sendCommand('move up')}>Up</button>
            <button className="bg-emerald-600 px-3 py-1 rounded mr-2" onClick={() => sendCommand('move down')}>Down</button>
            <button className="bg-emerald-600 px-3 py-1 rounded mr-2" onClick={() => sendCommand('move left')}>Left</button>
            <button className="bg-emerald-600 px-3 py-1 rounded" onClick={() => sendCommand('move right')}>Right</button>
          </div>

          <div className="mt-2">
            <button className="bg-sky-600 px-3 py-1 rounded mr-2" onClick={() => sendCommand('map')}>Map</button>
            <button className="bg-sky-600 px-3 py-1 rounded mr-2" onClick={() => sendCommand('status')}>Status</button>
            <button className="bg-yellow-600 px-3 py-1 rounded" onClick={() => sendCommand('inventory')}>Inventory</button>
          </div>
        </section>

        <section className="col-span-1 bg-zinc-800 p-4 rounded shadow-sm">
          <h3 className="font-semibold">Mini-map</h3>
          <div className="mt-2 p-2 bg-zinc-900 rounded min-h-[200px] overflow-auto">{
            map && <MapCanvas map={map} />
          }</div>
          <div className="mt-2 text-xs text-zinc-400">Legend:</div>
          <div className="mt-1 text-xs text-zinc-300 whitespace-pre-line">
            {  tile  }</div>
        </section>

        <section className="col-span-1 bg-zinc-800 p-4 rounded shadow-sm flex flex-col">
          <h3 className="font-semibold">Event Log</h3>
          <div className="mt-2 flex-1 overflow-auto font-mono text-sm text-zinc-200">
            {events.length === 0 ? <div className="text-zinc-400">No events yet</div> : (
              <ul>
                {events.map((ev, i) => <li key={i} className="mb-1">{ev}</li>)}
              </ul>
            )}
          </div>

          <div className="mt-4">
            <h4 className="font-medium">Inventory</h4>
            <div className="text-sm text-zinc-300 mt-2">
              {inventory.length === 0 ? <div className="text-zinc-400">Empty</div> : (
                <ul className="list-disc list-inside">
                  {inventory.map((it, idx) => <li key={idx}>{typeof it === 'string' ? it : `${it.name} x${it.qty || 1}`}</li>)}
                </ul>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="p-3 text-xs text-zinc-500 border-t border-zinc-800">Dashboard · React + Vite + Tailwind</footer>
    </div>
  );
}
