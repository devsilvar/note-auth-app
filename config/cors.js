const allowedOrigins = [
    "http://localhost:5173",
    "https://notelynew.netlify.app",
     process.env.FRONTEND_URL,
].filter(Boolean)

const corsOption = {
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, curl)
        if (!origin) return callback(null, true);

        // Normalize origin by removing trailing slash for comparison
        const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
        
        // Check if the normalized origin is in the allowed list
        const isAllowed = allowedOrigins.some(allowedOrigin => {
            const normalizedAllowed = allowedOrigin.endsWith('/') ? allowedOrigin.slice(0, -1) : allowedOrigin;
            return normalizedAllowed === normalizedOrigin;
        });

        if (isAllowed) {
            return callback(null, true);
        } else {
            return callback(new Error(`Origin ${origin} not allowed by CORS`));
        }    
    },

    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range']
};

module.exports = corsOption;