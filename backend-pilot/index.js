exports.handler = async (event) => {
    console.log("Received event:", JSON.stringify(event, null, 2));
    
    // Pilot SQLite logic (mocked) or generic logic
    const response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: "Hello from AWS Box Backend Pilot!",
            timestamp: new Date().toISOString()
        }),
    };
    
    return response;
};
