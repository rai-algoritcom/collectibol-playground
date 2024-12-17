
export const getCardConfigJSON = () => {
    const config = writeStorageConfig()
    if (config) {
        return config
    }
    return ({ })
}


export const writeStorageConfig = (config) => {
    const configString = JSON.stringify(config);
    localStorage.setItem('card_data', configString)
}


export const readStorageConfig = (config) => {
    const config = localStorage.getItem('card_data', config)
    if (!config) return null
    return JSON.parse(config)
}