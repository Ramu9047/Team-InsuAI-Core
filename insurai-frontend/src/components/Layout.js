import Navbar from "./Navbar";
import Chatbot from "./Chatbot";

export default function Layout({ children }) {
  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar />
      <div className="container" style={{ padding: "40px 20px" }}>
        {children}
      </div>
      <Chatbot />
    </div>
  );
}
