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
                    border: '.5px solid gainsboro',
                    borderRadius: '8px',
                    color: 'white',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    fontFamily: 'sans-serif',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
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