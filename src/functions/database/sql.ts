import sql from "mssql";

const config: sql.config = {
    server: process.env.DB_SERVER!,
    database: process.env.DB_DATABASE!,
    authentication: {
    type: "azure-active-directory-default",
    options: {}
},
    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};

let pool: sql.ConnectionPool;

export async function getConnection() {
    if (!pool) {
        pool = await sql.connect(config);
    }

    return pool;
}