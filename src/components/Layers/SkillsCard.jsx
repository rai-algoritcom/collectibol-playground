import { Html } from "@react-three/drei";
import SkillLabel from "./SkillLabel";
import { forwardRef } from "react";


const SkillsCard = forwardRef((props, ref) => {
    return (
        <Html   
                ref={ref}
                position={[0, -.8, 0.1]}
                transform
                scale={1}
                distanceFactor={2}
                distance
            >
                <div style={{ padding: '1rem', width: '360px', height: 'max-content', border: '1px solid transparent'}}>

                    <SkillLabel bgColor={'rgba(143, 50, 0, 0.5)'}>
                        <span>Lamine Yamal, la Revelación</span>
                    </SkillLabel>
                    <SkillLabel bgColor={'rgba(0, 0, 0, 0.5)'}>
                            <img src="/icons/ball.png" style={{ width: '30px', height: '30px'}} />
                            <span>Rematador estrella</span>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <img src="/icons/energy.png" style={{ width: '20px', height: '20px'}} />
                                <span>+2</span>
                            </div>
                    </SkillLabel>
                    <SkillLabel bgColor={'rgba(0, 0, 0, 0.5)'}>
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