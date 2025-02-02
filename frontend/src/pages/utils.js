const BACKEND_URL = "http://localhost:5000/"

const get = async (route) => {
    const response = await fetch(BACKEND_URL + route)
    const data = response.json()

    return data
}

const post = async (route, body) => {
    const response = await fetch(BACKEND_URL + route, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Specify that we're sending JSON data
        },
        body: JSON.stringify(body), // Convert the data object into a JSON string
    })
    
    const data = response.json()
    
    return data
}


export { get, post }