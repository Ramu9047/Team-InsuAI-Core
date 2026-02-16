import { useState } from "react";
import PropTypes from "prop-types";

export default function StarRating({ rating, onRatingChange, size = "medium", interactive = false, showCount = false, reviewCount = 0 }) {
    const [hoverRating, setHoverRating] = useState(0);

    const sizes = {
        small: 16,
        medium: 24,
        large: 32
    };

    const starSize = sizes[size] || sizes.medium;

    const handleClick = (value) => {
        if (interactive && onRatingChange) {
            onRatingChange(value);
        }
    };

    const handleMouseEnter = (value) => {
        if (interactive) {
            setHoverRating(value);
        }
    };

    const handleMouseLeave = () => {
        if (interactive) {
            setHoverRating(0);
        }
    };

    const displayRating = hoverRating || rating;

    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', gap: 4 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        onClick={() => handleClick(star)}
                        onMouseEnter={() => handleMouseEnter(star)}
                        onMouseLeave={handleMouseLeave}
                        style={{
                            fontSize: `${starSize}px`,
                            cursor: interactive ? 'pointer' : 'default',
                            color: star <= displayRating ? '#fbbf24' : '#4b5563',
                            transition: 'all 0.2s ease',
                            transform: interactive && hoverRating === star ? 'scale(1.2)' : 'scale(1)'
                        }}
                    >
                        ★
                    </span>
                ))}
            </div>

            {showCount && reviewCount > 0 && (
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                </span>
            )}

            {!showCount && rating > 0 && (
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
}

StarRating.propTypes = {
    rating: PropTypes.number.isRequired,
    onRatingChange: PropTypes.func,
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    interactive: PropTypes.bool,
    showCount: PropTypes.bool,
    reviewCount: PropTypes.number
};
