import { Text } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useControls } from "leva";


export default function TroikaTextLayer() {
    const { viewport } = useThree()
    const { color, fontSize, maxWidth, lineHeight, letterSpacing, content } = useControls('Text Overlay', {
        color: { value: "#ffffff", label: 'Color' },
        fontSize: { value: .1, min: 0, max: 1, label: 'Font Size' },
        maxWidth: { value: 1, min: 1, max: 5, label: 'Max Width' },
        lineHeight: { value: 0.75, min: 0.1, max: 10 , label: 'Line Height' },
        letterSpacing: { value: -0.08, min: -0.5, max: 1, label: 'Letter Spacing' },
        content: { value: 'LOREM IPSUM DOLOR SIT AMET', label: 'Content'}
    })

    return (
        <Text
            color={color}
            fontSize={fontSize}
            maxWidth={maxWidth}
            lineHeight={lineHeight}
            letterSpacing={letterSpacing}
            textAlign={'center'}
            font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
            anchorX="center"
            anchorY="top"
            position={[0, -1, .15]}
        >
            {content}
        </Text>
    )
}