import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import './PolicyPayment.css';

/**
 * Policy Payment Page
 * Handles payment processing for approved policies
 */
const PolicyPayment = () => {
    const { userPolicyId } = useParams();
    const navigate = useNavigate();
    const { notify } = useNotification();

    const [policyDetails, setPolicyDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Payment form state
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    useEffect(() => {
        fetchPolicyDetails();
    }, [userPolicyId]);

    const fetchPolicyDetails = async () => {
        try {
            setLoading(true);
            // Fetch user policy details
            const response = await api.get(`/api/user-policies/${userPolicyId}`);
            setPolicyDetails(response.data);
        } catch (error) {
            console.error('Error fetching policy:', error);
            notify('Failed to load policy details', 'error');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length) {
            return parts.join(' ');
        } else {
            return value;
        }
    };

    const formatExpiryDate = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.slice(0, 2) + '/' + v.slice(2, 4);
        }
        return v;
    };

    const handleCardNumberChange = (e) => {
        const formatted = formatCardNumber(e.target.value);
        if (formatted.replace(/\s/g, '').length <= 16) {
            setCardNumber(formatted);
        }
    };

    const handleExpiryChange = (e) => {
        const formatted = formatExpiryDate(e.target.value);
        if (formatted.length <= 5) {
            setExpiryDate(formatted);
        }
    };

    const handleCvvChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/gi, '');
        if (value.length <= 4) {
            setCvv(value);
        }
    };

    const validatePaymentForm = () => {
        if (paymentMethod === 'card') {
            if (cardNumber.replace(/\s/g, '').length !== 16) {
                notify('Please enter a valid 16-digit card number', 'error');
                return false;
            }
            if (!cardName.trim()) {
                notify('Please enter cardholder name', 'error');
                return false;
            }
            if (expiryDate.length !== 5) {
                notify('Please enter valid expiry date (MM/YY)', 'error');
                return false;
            }
            if (cvv.length < 3) {
                notify('Please enter valid CVV', 'error');
                return false;
            }
        }

        if (!agreedToTerms) {
            notify('Please agree to terms and conditions', 'error');
            return false;
        }

        return true;
    };

    const handlePayment = async () => {
        if (!validatePaymentForm()) {
            return;
        }

        setProcessing(true);

        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Activate policy
            await api.post(`/api/policy/activate/${userPolicyId}`, {
                paymentMethod,
                paymentDetails: {
                    cardLast4: cardNumber.slice(-4),
                    cardName
                }
            });

            notify('Payment successful! Your policy is now active.', 'success');

            // Redirect to policy details or dashboard
            setTimeout(() => {
                navigate('/my-policies');
            }, 1500);

        } catch (error) {
            console.error('Payment error:', error);
            notify('Payment failed. Please try again.', 'error');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="payment-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading payment details...</p>
                </div>
            </div>
        );
    }

    if (!policyDetails) {
        return (
            <div className="payment-container">
                <div className="error-state">
                    <h2>Policy Not Found</h2>
                    <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
                </div>
            </div>
        );
    }

    const policy = policyDetails.policy;
    const premium = policy.premium;
    const processingFee = (premium * 0.02).toFixed(2); // 2% processing fee
    const totalAmount = (parseFloat(premium) + parseFloat(processingFee)).toFixed(2);

    return (
        <div className="payment-container">
            <div className="payment-wrapper">
                {/* Header */}
                <div className="payment-header">
                    <button onClick={() => navigate(-1)} className="back-button">
                        ← Back
                    </button>
                    <h1>Complete Payment</h1>
                    <div className="secure-badge">
                        <span className="lock-icon">🔒</span>
                        <span>Secure Payment</span>
                    </div>
                </div>

                <div className="payment-content">
                    {/* Policy Summary */}
                    <div className="policy-summary-card">
                        <h2>Policy Summary</h2>
                        <div className="summary-details">
                            <div className="summary-row">
                                <span className="label">Policy Name:</span>
                                <span className="value">{policy.name}</span>
                            </div>
                            <div className="summary-row">
                                <span className="label">Type:</span>
                                <span className="value">{policy.type}</span>
                            </div>
                            <div className="summary-row">
                                <span className="label">Coverage:</span>
                                <span className="value">${policy.coverage.toLocaleString()}</span>
                            </div>
                            <div className="summary-row">
                                <span className="label">Monthly Premium:</span>
                                <span className="value">${premium}</span>
                            </div>
                            <div className="summary-row">
                                <span className="label">Processing Fee:</span>
                                <span className="value">${processingFee}</span>
                            </div>
                            <div className="summary-row total">
                                <span className="label">Total Amount:</span>
                                <span className="value">${totalAmount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Form */}
                    <div className="payment-form-card">
                        <h2>Payment Details</h2>

                        {/* Payment Method Selection */}
                        <div className="payment-methods">
                            <button
                                className={`method-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                                onClick={() => setPaymentMethod('card')}
                            >
                                <span className="method-icon">💳</span>
                                <span>Credit/Debit Card</span>
                            </button>
                            <button
                                className={`method-btn ${paymentMethod === 'upi' ? 'active' : ''}`}
                                onClick={() => setPaymentMethod('upi')}
                            >
                                <span className="method-icon">📱</span>
                                <span>UPI</span>
                            </button>
                            <button
                                className={`method-btn ${paymentMethod === 'netbanking' ? 'active' : ''}`}
                                onClick={() => setPaymentMethod('netbanking')}
                            >
                                <span className="method-icon">🏦</span>
                                <span>Net Banking</span>
                            </button>
                        </div>

                        {/* Card Payment Form */}
                        {paymentMethod === 'card' && (
                            <div className="card-form">
                                <div className="form-group">
                                    <label>Card Number</label>
                                    <input
                                        type="text"
                                        value={cardNumber}
                                        onChange={handleCardNumberChange}
                                        placeholder="1234 5678 9012 3456"
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Cardholder Name</label>
                                    <input
                                        type="text"
                                        value={cardName}
                                        onChange={(e) => setCardName(e.target.value)}
                                        placeholder="John Doe"
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Expiry Date</label>
                                        <input
                                            type="text"
                                            value={expiryDate}
                                            onChange={handleExpiryChange}
                                            placeholder="MM/YY"
                                            className="form-input"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>CVV</label>
                                        <input
                                            type="password"
                                            value={cvv}
                                            onChange={handleCvvChange}
                                            placeholder="123"
                                            className="form-input"
                                            maxLength="4"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* UPI Payment */}
                        {paymentMethod === 'upi' && (
                            <div className="upi-form">
                                <div className="form-group">
                                    <label>UPI ID</label>
                                    <input
                                        type="text"
                                        placeholder="yourname@upi"
                                        className="form-input"
                                    />
                                </div>
                                <p className="payment-note">
                                    You will receive a payment request on your UPI app
                                </p>
                            </div>
                        )}

                        {/* Net Banking */}
                        {paymentMethod === 'netbanking' && (
                            <div className="netbanking-form">
                                <div className="form-group">
                                    <label>Select Bank</label>
                                    <select className="form-input">
                                        <option value="">Choose your bank</option>
                                        <option value="sbi">State Bank of India</option>
                                        <option value="hdfc">HDFC Bank</option>
                                        <option value="icici">ICICI Bank</option>
                                        <option value="axis">Axis Bank</option>
                                    </select>
                                </div>
                                <p className="payment-note">
                                    You will be redirected to your bank's secure payment gateway
                                </p>
                            </div>
                        )}

                        {/* Terms and Conditions */}
                        <div className="terms-checkbox">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                            />
                            <label htmlFor="terms">
                                I agree to the <a href="/terms" target="_blank">Terms & Conditions</a> and <a href="/privacy" target="_blank">Privacy Policy</a>
                            </label>
                        </div>

                        {/* Payment Button */}
                        <button
                            className="pay-button"
                            onClick={handlePayment}
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <span className="button-spinner"></span>
                                    Processing...
                                </>
                            ) : (
                                `Pay $${totalAmount}`
                            )}
                        </button>

                        {/* Security Note */}
                        <div className="security-note">
                            <span className="shield-icon">🛡️</span>
                            <p>Your payment information is encrypted and secure</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PolicyPayment;
