export default () => ({
    port: parseInt(process.env.PORT || '3005', 10),
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_DATABASE || 'railway',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key-your-secret-key-your-secret-key-your-secret-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
});