import axios from 'axios'

export async function registerUser(user) {
    const res = await axios.post("/users", user).catch((e) => {
        const { response } = e
        return response
    })
    return res
}


export async function loginUser(user) {
    const res = await axios.post("/login", user).catch((e) => {
        const { response } = e
        return response
    })
    return res
}
