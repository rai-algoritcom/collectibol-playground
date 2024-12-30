import { Html } from "@react-three/drei";
import SkillLabel from "./SkillLabel";
import { forwardRef, useEffect } from "react";
import * as THREE from 'three'


const SkillsCard = forwardRef(({ labelRef1, labelRef2, labelRef3 }, ref) => {

    return (
        <Html   
                frustumCulled={true}
                ref={ref}
                position={[0, -.8, 0.1]}
                transform
                scale={1}
                distanceFactor={2}
                distance
                side={THREE.FrontSide}
            >
                <div style={{ pointerEvents: 'none', padding: '1rem', width: '360px', height: 'max-content', border: '1px solid transparent'}}>

                    <SkillLabel ref={labelRef1} bgColor={'rgba(143, 50, 0, 0.5)'} >
                        <span>Lamine Yamal, la Revelación</span>
                    </SkillLabel>
                    <SkillLabel ref={labelRef2} bgColor={'rgba(0, 0, 0, 0.5)'} >
                            <img src="/icons/ball.png" style={{ width: '30px', height: '30px'}} />
                            <span>Rematador estrella</span>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <img src="/icons/energy.png" style={{ width: '20px', height: '20px'}} />
                                <span>+2</span>
                            </div>
                    </SkillLabel>
                    <SkillLabel ref={labelRef3} bgColor={'rgba(0, 0, 0, 0.5)'} >
                            <img src="/icons/player.png" style={{ width: '40px', height: '40px'}} />
                            <span>Centrocampista táctico</span>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <img src="/icons/energy.png" style={{ width: '20px', height: '20px'}} />
                                <span>+1</span>
                            </div>
                    </SkillLabel>
               
                </div>
        </Html>
    )
})

export default SkillsCard