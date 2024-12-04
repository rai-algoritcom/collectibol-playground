import { forwardRef } from "react"


const SkillLabel = forwardRef(({ children, bgColor }, ref) => {


    return (
        <div ref={ref} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div
                        style={{
                            fontFamily: "'Inter Tight', sans-serif", 
                            fontWeight: 'bold',
                            width: '350px',
                            height: '50px',
                            background: bgColor,
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            color: 'white',
                            padding: '5px',
                            paddingLeft: '2rem',
                            paddingRight: '2rem',
                            WebkitFontSmoothing: 'antialiased',
                            MozOsxFontSmoothing: 'grayscale',
                            transform: 'translateZ(0)', // Force GPU rendering
                            willChange: 'transform', // Optimize for transformations
                            margin: '.25rem',
                            fontSize: '14px'
                        }}
                    >
                        {children}
                    </div>
        </div> 
    )
})

export default SkillLabel