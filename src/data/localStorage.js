


export const getCardConfigJSON = () => {
    const cardConfig = readStorageConfig()
    if (cardConfig) {
        return cardConfig
    }
    return ({
        layout_color: { r: 44, g: 44, b: 49 },
        albedo_ch: {
            base_albedo: true,
            pattern_albedo: true,
            main_interest_albedo: true,
            layout_albedo: true,
            grading_v2_doblez_albedo: true,
            grading_v2_exterior_albedo: true,
            grading_v2_manchas_albedo: true,
            grading_v2_rascado_albedo: true,
            grading_v2_scratches_albedo: false 
        },
        alpha_ch: {
            base_alpha: true
        },
        roughness_ch: {
            base_roughness: false,
            grading_v2_doblez_roughness: true,
            grading_v2_exterior_roughness: true,
            grading_v2_rascado_roughness: true,
            grading_v2_scratches_roughness: true
        },
        normal_ch: {
            base_normal: true
        },
        height_ch: {
            base_height: false,
            layout_height: false,
            main_interest_height: true
        },
        roughness_intensity: 1.1,
        roughness_presence: 0.55,
        normal_intensity: 5,
        displacement_scale: 0.01,
        lights: {
            ambient_light_color: { r: 2, g: 2, b: 2 },
            ambient_light_intensity: 0.35,

            point_light_color: { r: 248, g: 223, b: 177 },
            point_light_intensity: 1,
            point_light_decay: 1.2,
            point_light_pos: { x: -4, y: 1, z: 1 },

            point_light_color_2: { r: 149, g: 181, b: 230 },
            point_light_intensity_2: 1.0,
            point_light_decay_2: 1.2,
            point_light_pos_2: { x: 4, y: 1, z: 1 }
        },
        brightness: {
            brightness_intensity: 0.6,
            use_brightness: false
        },
        iridescence: {
            iridescence_intensity: 0.6,
            use_iridescence: false
        },
        shine: {
            shine_intensity: 0.0045,
            use_shine: false,
            shine_color: { r: 231, g: 245, b: 81 }
        },
        refraction: {
            refraction_intensity: 1,
            use_refraction: false,
            stripes_visible: false
        },
        transition: {
            use_transition: true,
            transition_speed: 0.8,
        },
        folding: {
            fold_intensity: 0.65,
            use_folding: false,
            fold_rotation: 0.12,
            fold_x: 0.8,
            fold_y: 1.43
        },
        use_video: true,
        vertex_fx: {
            id: 'none'
        },
        fragment_fx: {
            id: 'none',
            trigger: 'rotation'
        }
    })
}


export const writeStorageConfig = (config) => {
    const cardConfig = JSON.stringify(config);
    localStorage.setItem('card_data', cardConfig)
}


export const readStorageConfig = (config) => {
    const cardConfig = localStorage.getItem('card_data', config)
    if (!cardConfig) return null
    return JSON.parse(cardConfig)
}


export const removeStorageConfig = () => {
    localStorage.removeItem('card_data')
    return window.location.reload()
} 