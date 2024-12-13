import { Html } from "@react-three/drei";
import { forwardRef } from "react";
import * as THREE from 'three'

const FooterCard = forwardRef(({ blendMode, planeOcclude }, ref) => {

    return (
        <Html
            side={THREE.FrontSide}
            frustumCulled={true}
            ref={ref}
            position={[0, blendMode ? -0.36 : -1.35, 0.005]}
            transform
            scale={1}
            distanceFactor={2}
            distance
        >
            <div style={{ display: 'flex', width: '370px', justifyContent: 'space-between', alignItems: 'center',  marginTop: '.25rem' }}>
                <div style={{ color: 'white', fontFamily: "'Inter Tight', sans-serif"}}>
                    <span style={{fontSize: '9px', fontWeight: 'bold', color: 'gainsboro'}}>FC BARCELONA</span>
                    <span style={{fontSize: '8px', fontWeight: 'bold', display: 'block', color: 'gainsboro'}}>&copy; 2025 Collectibol</span>
                </div>
                <div style={{ marginLeft: '-1rem'  }}>
                    <img src="/icons/rare.png" style={{ width: '60px', height: '60px'}} />
                </div>
                <div style={{ color: 'white', fontFamily: "'Inter Tight', sans-serif" }}>
                    <span style={{fontSize: '18px', fontWeight: 'bold', color: 'gainsboro'}}>EX 3</span>
                    <span style={{fontSize: '8px', fontWeight: 'bold', display: 'block', color: 'gainsboro'}}>25 18 A0 45</span>
                </div>
            </div>
        </Html>
    )
})


export default FooterCard