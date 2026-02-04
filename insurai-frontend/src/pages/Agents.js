import { useEffect, useState } from "react";
import api from "../services/api";
import Card from "../components/Card";

export default function ChooseAgent() {
  const [agents, setAgents] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get("/agents/available").then(res => setAgents(res.data));
  }, []);

  return (
    <Card title="Choose an Agent">
      {agents.map(a => (
        <div key={a.id}
          onClick={() => setSelected(a)}
          style={{
            padding:12,
            borderRadius:12,
            marginBottom:10,
            cursor:"pointer",
            background: selected?.id === a.id ? "#4ade80" : "rgba(255,255,255,0.15)"
          }}
        >
          <strong>{a.name}</strong> — {a.email}
        </div>
      ))}

      {selected && <button>Confirm Agent</button>}
    </Card>
  );
}
