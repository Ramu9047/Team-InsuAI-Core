import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi! I'm InsurAI. Ask me anything about policies or claims.", sender: "bot" }
    ]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    // Voice Logic
    const [isListening, setIsListening] = useState(false);
    const [voiceSupported, setVoiceSupported] = useState(true);
    const recognitionRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setVoiceSupported(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = "en-US";
        recognition.interimResults = true; // Real-time feedback

        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');

            setInput(transcript);
        };

        recognition.onerror = (event) => {
            console.error("Speech error", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
    }, []);

    const toggleListening = () => {
        if (!isListening) {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (e) {
                console.error(e);
            }
        } else {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    const toggle = () => setIsOpen(prev => !prev);

    const sendMessage = async () => {
        if (!input.trim()) return;

        // Add User Message
        const userMsg = { text: input, sender: "user" };
        setMessages(prev => [...prev, userMsg]);
        setInput("");

        // Call AI
        try {
            const res = await api.post("/ai/chat", { message: input });
            const botMsg = { text: res.data.response, sender: "bot" };
            setMessages(prev => [...prev, botMsg]);
        } catch (e) {
            setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting to the AI brain.", sender: "bot" }]);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <>
            <motion.div
                whileHover={{ scale: 1.1, boxShadow: "0 0 40px rgba(99, 102, 241, 0.6)" }}
                whileTap={{ scale: 0.9 }}
                onClick={toggle}
                style={{
                    position: "fixed", bottom: 40, right: 40,
                    width: 64, height: 64, borderRadius: "50%",
                    background: "var(--gradient-main)",
                    color: "white", display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "var(--shadow-neon)",
                    cursor: "pointer", zIndex: 1000, fontSize: 32,
                    border: "2px solid rgba(255, 255, 255, 0.2)"
                }}
            >
                🤖
            </motion.div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.9, rotateX: 10 }}
                        animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                        exit={{ opacity: 0, y: 30, scale: 0.9, rotateX: 10 }}
                        style={{
                            position: "fixed", bottom: 120, right: 40,
                            width: 380, height: 600, maxHeight: "70vh",
                            background: "rgba(15, 23, 42, 0.95)", // Deep dark glass
                            backdropFilter: "blur(20px)",
                            borderRadius: 24,
                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.15)", // Premium shadow
                            display: "flex", flexDirection: "column",
                            overflow: "hidden", zIndex: 1000,
                            border: "var(--glass-border)",
                            color: "var(--text-main)"
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: "20px 24px",
                            background: "linear-gradient(to right, rgba(99, 102, 241, 0.1), transparent)",
                            borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                            display: "flex", alignItems: "center", gap: 12
                        }}>
                            <div style={{
                                width: 12, height: 12, borderRadius: "50%",
                                background: "#22c55e", boxShadow: "0 0 10px #22c55e"
                            }}></div>
                            <div>
                                <strong style={{ display: "block", fontSize: "1.1rem" }}>InsurAI Assistant</strong>
                                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginTop: 2 }}>Always here to help</span>
                            </div>
                            <button onClick={toggle} style={{
                                marginLeft: "auto", background: "transparent", border: "none", color: "var(--text-muted)",
                                cursor: "pointer", fontSize: "1.2rem"
                            }}>✕</button>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, padding: 20, overflowY: "auto", display: "flex", flexDirection: "column", gap: 15 }}>
                            {messages.map((m, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        alignSelf: m.sender === 'user' ? "flex-end" : "flex-start",
                                        maxWidth: "85%",
                                        padding: "12px 18px",
                                        borderRadius: 16,
                                        background: m.sender === 'user' ? "var(--gradient-main)" : "rgba(255, 255, 255, 0.05)",
                                        color: "white",
                                        fontSize: "0.95rem",
                                        lineHeight: "1.5",
                                        border: m.sender === 'user' ? "none" : "1px solid rgba(255, 255, 255, 0.05)",
                                        borderBottomRightRadius: m.sender === 'user' ? 4 : 16,
                                        borderBottomLeftRadius: m.sender === 'bot' ? 4 : 16,
                                        boxShadow: m.sender === 'user' ? "0 4px 15px rgba(99, 102, 241, 0.3)" : "none"
                                    }}>
                                    {m.text}
                                </motion.div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div style={{ padding: 20, borderTop: "1px solid rgba(255, 255, 255, 0.05)", display: "flex", gap: 12, alignItems: "center" }}>
                            {voiceSupported && (
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={toggleListening}
                                    style={{
                                        background: "transparent", border: "none", cursor: "pointer",
                                        color: isListening ? "#ef4444" : "var(--text-muted)",
                                        fontSize: "1.3rem", padding: 5, display: "flex"
                                    }}
                                    animate={isListening ? { scale: [1, 1.2, 1], transition: { repeat: Infinity } } : {}}
                                >
                                    {isListening ? "🛑" : "🎙️"}
                                </motion.button>
                            )}

                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                placeholder={isListening ? "Listening..." : "Type your query..."}
                                style={{
                                    flex: 1,
                                    background: "rgba(255,255,255,0.03)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: 50,
                                    padding: "12px 20px",
                                    color: "white",
                                    outline: "none",
                                    fontSize: "0.95rem",
                                    transition: "all 0.3s"
                                }}
                                onFocus={e => e.target.style.borderColor = "var(--primary)"}
                                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                            />
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={sendMessage}
                                style={{
                                    width: 45, height: 45, borderRadius: "50%",
                                    background: "var(--gradient-main)", border: "none",
                                    color: "white", display: "flex", alignItems: "center", justifyContent: "center",
                                    cursor: "pointer", boxShadow: "0 0 15px rgba(99, 102, 241, 0.4)"
                                }}
                            >
                                ➤
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
