export const changeArrayToString = (error) => {
    let message = error.response?.data?.message
    if (Array.isArray(message)) {
    // make message joined with a new line
        message = message.join('\n')
    }

    return message
}