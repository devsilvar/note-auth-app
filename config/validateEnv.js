const validateEnv = ()=>{
    const required= [
        'NODE_ENV',
        'MONGO_URI',
        'JWT_SECRET',
        'JWT_EXPIRES_IN',
        'FRONTEND_URL'
    ]
    for (const key of required) {
        if (!process.env[key]) {
            throw new Error(`Environment variable not set: ${key}`);
            process.exit(1)
        }
    }
    if(process.env.JWT_SECRET.length < 32){
        console.error('JWT SECRET too short')
        process.exit(1)
    }
}

module.exports = validateEnv