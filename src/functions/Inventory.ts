import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function Inventory(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {

    context.log(`Http function processed request for url "${request.url}"`);

    const items = [
        {
            id: 1,
            sku: "WATER001",
            name: "Bottled Water",
            description: "500ml bottled water",
            category: "Drinks",
            unit: "Bottle",
            active: true,
            createdAt: "2026-07-30T12:00:00Z",
            updatedAt: "2026-07-30T12:00:00Z"
        },
        {
            id: 2,
            sku: "NOTE001",
            name: "Notebook",
            description: "College ruled notebook",
            category: "Office",
            unit: "Each",
            active: true,
            createdAt: "2026-07-29T09:15:00Z",
            updatedAt: "2026-07-30T10:45:00Z"
        }
    ];

    return {
        status: 200,
        jsonBody: items
    };
}

app.http("GetItems", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "items",
    handler: Inventory
});