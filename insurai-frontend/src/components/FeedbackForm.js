import { useState } from "react";
import { useNotification } from "../context/NotificationContext";
import api from "../services/api";

export default function FeedbackForm() {
    const { notify } = useNotification();
    const [formData, setFormData] = useState({
        category: "",
        subject: "",
        description: ""
    });
    const [submitting, setSubmitting] = useState(false);

    const categories = [
        { value: "BUG", label: "🐛 Bug Report", description: "Report a technical issue" },
        { value: "QUERY", label: "❓ Query", description: "Ask a question" },
        { value: "SUGGESTION", label: "💡 Suggestion", description: "Share an idea" },
        { value: "COMPLAINT", label: "⚠️ Complaint", description: "Report a problem" }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.category) {
            notify("Please select a category", "error");
            return;
        }

        if (!formData.subject.trim()) {
            notify("Please enter a subject", "error");
            return;
        }

        if (!formData.description.trim()) {
            notify("Please enter a description", "error");
            return;
        }

        setSubmitting(true);

        try {
            const response = await api.post("/feedback", formData);
            notify(response.data.message || "Feedback submitted successfully!", "success");

            // Reset form
            setFormData({
                category: "",
                subject: "",
                description: ""
            });
        } catch (error) {
            notify(error.response?.data?.error || "Failed to submit feedback", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="card" style={{ maxWidth: 800, margin: '0 auto', padding: 30 }}>
            <h2 style={{ marginBottom: 10 }}>Submit Feedback</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 30 }}>
                We value your feedback! Let us know how we can improve.
            </p>

            <form onSubmit={handleSubmit}>
                {/* Category Selection */}
                <div style={{ marginBottom: 25 }}>
                    <label style={{ display: 'block', marginBottom: 12, fontWeight: 600 }}>
                        Category *
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                        {categories.map((cat) => (
                            <div
                                key={cat.value}
                                onClick={() => setFormData({ ...formData, category: cat.value })}
                                style={{
                                    padding: 15,
                                    borderRadius: 8,
                                    border: `2px solid ${formData.category === cat.value ? 'var(--primary)' : 'var(--card-border)'}`,
                                    background: formData.category === cat.value ? 'rgba(102, 126, 234, 0.1)' : 'rgba(255,255,255,0.02)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ fontSize: '1.1rem', marginBottom: 5 }}>{cat.label}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{cat.description}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Subject */}
                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                        Subject *
                    </label>
                    <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Brief summary of your feedback"
                        maxLength={255}
                        required
                        style={{
                            width: '100%',
                            padding: 12,
                            borderRadius: 8,
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--card-border)',
                            color: 'white',
                            fontSize: '1rem'
                        }}
                    />
                </div>

                {/* Description */}
                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                        Description *
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Provide detailed information..."
                        rows={6}
                        maxLength={2000}
                        required
                        style={{
                            width: '100%',
                            padding: 12,
                            borderRadius: 8,
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--card-border)',
                            color: 'white',
                            fontFamily: 'inherit',
                            fontSize: '1rem',
                            resize: 'vertical'
                        }}
                    />
                    <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 5 }}>
                        {formData.description.length}/2000
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={submitting}
                    className="primary-btn"
                    style={{
                        width: '100%',
                        padding: 14,
                        fontSize: '1rem',
                        opacity: submitting ? 0.6 : 1
                    }}
                >
                    {submitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
            </form>

            {/* Info Box */}
            <div style={{
                marginTop: 30,
                padding: 15,
                borderRadius: 8,
                background: 'rgba(102, 126, 234, 0.1)',
                border: '1px solid var(--primary)'
            }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    💡 <strong>Tip:</strong> For urgent issues, please contact our support team directly at support@insurai.com
                </p>
            </div>
        </div>
    );
}
