import { getRandomPositionAndRotation } from "./helpers"


export default function getGradingProps () {
    
    const doblezRand = getRandomPositionAndRotation()
    const rascadoRand = getRandomPositionAndRotation()
    const scratchesRand = getRandomPositionAndRotation()
    const manchasRand = getRandomPositionAndRotation()

    const {
        posDoblez, 
        rotDoblez
    } = {
        posDoblez: doblezRand.pos, 
        rotDoblez: doblezRand.rot
    }

    const {
        posManchas, 
        rotManchas
    } = {
        posManchas: manchasRand.pos,
        rotManchas: manchasRand.rot
    }

    const {
        posRascado, 
        rotRascado
    } = {
        posRascado: rascadoRand.pos, 
        rotRascado: rascadoRand.rot
    }

    const {
        posScratches, 
        rotScratches
    } = {
        posScratches: scratchesRand.pos,
        rotScratches: scratchesRand.rot
    }


    const gradingRoughnessProps = {
        doblez: {
            pos: posDoblez,
            rot: rotDoblez,
        },
        rascado: {
            pos: posRascado,
            rot: rotRascado
        },
        scratches: {
            pos: posScratches,
            rot: rotScratches
        }
    }

    const gradingNormalsProps = {
        scratches: {
            pos: posScratches,
            rot: rotScratches
        },
        doblez: {
            pos: posDoblez, 
            rot: rotDoblez
        },
        rascado: {
            pos: posRascado,
            rot: rotRascado
        }
    }

    const gradingAlbedoProps = {
        manchas: {
            pos: posManchas,
            rot: rotManchas
        },
        doblez: {
            pos: posDoblez, 
            rot: rotDoblez
        },
        rascado: {
            pos: posRascado,
            rot: rotRascado
        },
        scratches: {
            pos: posScratches,
            rot: rotScratches
        },
    }

    return {
        gradingRoughnessProps,
        gradingNormalsProps,
        gradingAlbedoProps
    }
}