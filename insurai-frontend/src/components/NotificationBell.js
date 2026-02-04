import { useEffect, useState } from "react";
import api from "../services/api";

export default function NotificationBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    const i = setInterval(() => {
      api.get(`/notifications/agent/${id}`).then(r => setCount(r.data.length));
    }, 5000);
    return () => clearInterval(i);
  }, []);

  return <div>🔔 {count}</div>;
}
