import { Link } from "react-router-dom";

export default function LinkButton({
    to,
    content
}) {
    return (
        <Link
                to={to}
                style={{
                    position: 'absolute',
                    bottom: '2rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '0.75rem 1.5rem',
                    fontSize: '.85rem',
                    textAlign: 'center',
                    textDecoration: 'none',
                    border: '2px solid white',
                    borderRadius: '8px',
                    color: 'white',
                    background: 'rgba(255, 255, 255, 0.1)', // Subtle transparent background
                    backdropFilter: 'blur(10px)', // Blur effect for modern aesthetics
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    fontFamily: 'sans-serif',
                    fontWeight: '400'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.color = 'black';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.color = 'white';
                  }}
            >
                { content } &rarr;
            </Link>
    )
}