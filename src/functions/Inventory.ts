import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function Inventory(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const items = [
        {
            id: 1,
            sku: "WATER001",
            name: "Bottled Water",
            category: "Drinks",
            quantity: 50,
            active: true
        },
        {
            id: 2,
            sku: "NOTE001",
            name: "Notebook",
            category: "Office",
            quantity: 20,
            active: true
        }
    ];

      return {
        status: 200,
        jsonBody: {
            message: "Inventory API is working!",
            items: items
        }
      };
}

app.http('Inventory', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: Inventory
});
