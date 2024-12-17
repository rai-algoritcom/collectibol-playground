import { useAnimations, useFBX, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";


export default function AnimCards() {
    // const scene = useGLTF('/models/cards.glb')

    const cardRef = useRef()

    // const card = useFBX('/fbx/collectibol_anim_Card.fbx')
    // const card = useFBX('/fbx/collectibol_anim_Bone.fbx')
    const card = useGLTF('/models/cards.glb')
    const animation = useFBX('/fbx/collectibol_anim_Bone.fbx')

    const { actions, mixer } = useAnimations(
        animation.animations,
        cardRef
    )
    

    useEffect(() => {
        if (actions && cardRef.current) 
        {
           if (actions['Armature|Armature|anim_01']) {
                actions['Armature|Armature|anim_01'].play()
           }
        }
    }, [actions, cardRef.current])



    useEffect(() => {
        console.log(cardRef.current)
    }, [cardRef.current])




    return (
        <primitive 
            ref={cardRef}
            object={card.scene}
            rotation={[ 0, 0, 0]}
            position={[0, 0, 0]}
            scale={[1, 1, 1]}
        />
    )
}