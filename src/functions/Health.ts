import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getConnection } from "./database/sql";

export async function Health(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {

    try {
        const pool = await getConnection();

        await pool.request().query("SELECT 1");

        return {
            status: 200,
            jsonBody: {
                status: "healthy",
                database: "connected",
                service: "Inventory Backend",
                timestamp: new Date().toISOString()
            }
        };

    } catch (error) {
        context.error(error);

        return {
            status: 500,
            jsonBody: {
                status: "unhealthy",
                database: "failed",
                error: error instanceof Error ? error.message : error
            }
        };
    }
}


app.http("Health", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "health",
    handler: Health
});