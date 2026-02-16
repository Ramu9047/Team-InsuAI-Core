import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ParticleHero from "../components/ParticleHero";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const problems = [
    {
      title: "Outdated Systems",
      desc: "Traditional insurance relies on paperwork and slow legacy systems. We replaced them with instant, AI-driven digital workflows.",
      icon: "💾"
    },
    {
      title: "Hidden Clauses",
      desc: "Policies often hide behind complex jargon. Our AI scans and explains every clause in plain English before you sign.",
      icon: "🔍"
    },
    {
      title: "Slow Claims",
      desc: "Waiting months for a claim is painful. InsurAI processes standard claims in minutes using visual recognition.",
      icon: "⏱️"
    },
    {
      title: "Generic Plans",
      desc: "One size fits no one. Our algorithms analyze your life stage and risk profile to tailor the perfect coverage.",
      icon: "🎯"
    },
    {
      title: "Poor Support",
      desc: "Chatbots that don't understand you? Our adaptive support agents solve complex queries instantly.",
      icon: "🤖"
    },
    {
      title: "Data Insecurity",
      desc: "Your data is sensitive. We use military-grade encryption and blockchain ledgers for immutable security.",
      icon: "🔒"
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        minHeight: "85vh",
        display: "flex",
        alignItems: "center",
        background: "radial-gradient(circle at center, #111827 0%, #000000 100%)",
        position: "relative",
        overflow: "hidden",
        paddingTop: "80px" // Account for fixed navbar
      }}>

        {/* Layer 1: Particle Background */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1 }}>
          <ParticleHero />
        </div>

        {/* Layer 2: Content (Front) */}
        <div className="container" style={{ position: "relative", zIndex: 10, pointerEvents: "none" }}> {/* pointerEvents none on container to let clicks pass through to canvas if needed, but buttons need pointerEvents auto */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            style={{ maxWidth: "40%", pointerEvents: "auto" }} // Re-enable pointer events for buttons/text selection
          >
            <h1 className="text-gradient" style={{ fontSize: "5rem", lineHeight: "1.05", marginBottom: "30px", fontWeight: "800" }}>
              You can't afford to choose the wrong insurer.
            </h1>
            <p style={{ fontSize: "1.35rem", color: "#94a3b8", lineHeight: "1.6", marginBottom: "40px", maxWidth: "90%" }}>
              Because if you do? It means financial risk, slow recovery, and mountains of stress.
              Months of lost opportunity. And starting over from scratch.
            </p>

            <div style={{ display: "flex", gap: "20px" }}>
              <button
                className="primary-btn"
                style={{ padding: "18px 48px", fontSize: "1.2rem", cursor: "pointer" }}
                onClick={() => {
                  if (user) {
                    navigate("/plans");
                  } else {
                    navigate("/login");
                  }
                }}
              >
                Explore Plans
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem-Solution Blocks */}
      < section className="container" >
        <div className="grid">
          {problems.map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="card"
              style={{
                padding: "40px",
                borderTop: "4px solid rgba(99, 102, 241, 0.4)",
                background: "linear-gradient(180deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0) 100%)"
              }}
            >
              <div style={{
                fontSize: "3rem", marginBottom: "20px",
                textShadow: "0 0 20px rgba(99, 102, 241, 0.4)"
              }}>
                {item.icon}
              </div>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "15px", color: "white" }}>{item.title}</h3>
              <p style={{ color: "var(--text-muted)", lineHeight: "1.7", fontSize: "1.05rem" }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section >

      {/* CTA Section */}
      < section className="container" style={{ margin: "100px auto", textAlign: "center" }
      }>
        <div className="card" style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
          padding: "60px",
          border: "1px solid rgba(99, 102, 241, 0.3)"
        }}>
          <h2 style={{ fontSize: "2.5rem", marginBottom: "30px" }}>Ready for the future?</h2>
          <button
            className="primary-btn"
            style={{ padding: "18px 48px", fontSize: "1.2rem", cursor: "pointer" }}
            onClick={() => {
              if (user) {
                navigate("/plans");
              } else {
                navigate("/login");
              }
            }}
          >
            Get Insured Now
          </button>
        </div>
      </section >
    </div >
  );
}
