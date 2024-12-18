import { Link } from "react-router-dom";

export default function ResetButton({
    onClick
}) {
    return (
        <Link
                onClick={onClick}
                style={{
                    position: 'absolute',
                    bottom: '2rem',
                    left: '5%',
                    transform: 'translateX(-50%)',
                    padding: '0.75rem 1.5rem',
                    fontSize: '.85rem',
                    textAlign: 'center',
                    textDecoration: 'none',
                    border: '2px solid black',
                    borderRadius: '8px',
                    color: 'white',
                    background: 'rgba(255, 255, 255, 0.1)', // Subtle transparent background
                    backdropFilter: 'blur(10px)', // Blur effect for modern aesthetics
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    fontFamily: 'sans-serif',
                    fontWeight: '400',
                    display: 'flex',
                    alignItems: 'center'
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
                Reset <span style={{ marginLeft: '.25rem', fontSize: '1rem' }}>🛠️</span>
            </Link>
    )
}