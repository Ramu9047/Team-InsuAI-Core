import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";

export default function VoiceAssistant() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [response, setResponse] = useState(null);
    const [showResponse, setShowResponse] = useState(false);
    const [supported, setSupported] = useState(true);

    // Speech Recognition Setup
    const recognitionRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setSupported(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = "en-US";
        recognition.interimResults = false;

        recognition.onresult = async (event) => {
            const text = event.results[0][0].transcript;
            setTranscript(text);
            setIsListening(false);
            recognition.stop();
            processQuery(text);
        };

        recognition.onerror = (event) => {
            console.error("Speech error", event.error);
            setIsListening(false);
            setTranscript("Error listening. Try again.");
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
    }, []);

    const processQuery = async (text) => {
        try {
            // Send to backend
            const res = await api.post("/query", { query: text });
            setResponse(res.data);
        } catch (err) {
            console.error(err);
            setResponse({ message: "Sorry, I couldn't process that query." });
        }
    };

    const startListening = () => {
        if (!recognitionRef.current) return;
        setIsListening(true);
        setTranscript("");
        setResponse(null);
        setShowResponse(true);
        try {
            recognitionRef.current.start();
        } catch (e) {
            console.error(e);
        }
    };

    const stopListening = () => {
        if (!recognitionRef.current) return;
        setIsListening(false);
        recognitionRef.current.stop();
    };

    if (!supported) return null;

    return (
        <>
            {/* Floating Action Button */}
            <motion.button
                onClick={isListening ? stopListening : startListening}
                whileHover={{ scale: 1.1, boxShadow: "0 0 25px rgba(239, 68, 68, 0.6)" }}
                whileTap={{ scale: 0.9 }}
                style={{
                    position: "fixed",
                    bottom: 40,
                    left: 40, // Moved to left to avoid overlap with Chatbot
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: isListening ? "#ef4444" : "rgba(15, 23, 42, 0.8)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    backdropFilter: "blur(10px)",
                    boxShadow: isListening ? "0 0 30px rgba(239, 68, 68, 0.4)" : "0 10px 25px rgba(0,0,0,0.3)",
                    color: "white",
                    cursor: "pointer",
                    zIndex: 1000,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28
                }}
            >
                {isListening ? "🛑" : "🎙️"}
            </motion.button>

            {/* Chat Bubble Interface */}
            <AnimatePresence>
                {showResponse && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: -20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, x: -20 }}
                        style={{
                            position: "fixed",
                            bottom: 120,
                            left: 40,
                            width: 320,
                            background: "rgba(15, 23, 42, 0.95)",
                            backdropFilter: "blur(20px)",
                            borderRadius: "24px",
                            padding: "24px",
                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(99, 102, 241, 0.1)",
                            zIndex: 1000,
                            border: "var(--glass-border)",
                            color: "var(--text-main)"
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15 }}>
                            <strong className="text-gradient" style={{ fontSize: "1.1rem" }}>AI Voice Assistant</strong>
                            <button
                                onClick={() => setShowResponse(false)}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "1.2rem" }}
                            >✕</button>
                        </div>

                        {transcript && (
                            <div style={{ marginBottom: 20, fontStyle: "italic", color: "var(--text-muted)", padding: 10, background: "rgba(255,255,255,0.05)", borderRadius: 8 }}>
                                "{transcript}"
                            </div>
                        )}

                        <div style={{ minHeight: 40 }}>
                            {isListening && <p style={{ color: "#ef4444", fontWeight: "bold", margin: 0 }}>Listening...</p>}

                            {!isListening && !response && transcript && <p style={{ margin: 0, color: "var(--primary)" }}>Thinking...</p>}

                            {response && (
                                <div style={{ animation: "fadeIn 0.3s" }}>
                                    <p style={{ margin: 0, lineHeight: 1.5 }}>{response.message}</p>
                                    {response.type === "AGENTS_LIST" && response.data && (
                                        <ul style={{ paddingLeft: 20, marginTop: 10, color: "var(--text-muted)" }}>
                                            {response.data.slice(0, 3).map(a => (
                                                <li key={a.id}>{a.name}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
