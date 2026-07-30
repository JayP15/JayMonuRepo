import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getConnection } from "./database/sql";

export async function Products(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {

    try {
        const pool = await getConnection();

        // GET all products
        if (request.method === "GET") {
            const result = await pool
                .request()
                .query("SELECT * FROM Products");

            return {
                status: 200,
                jsonBody: result.recordset
            };
        }


        // CREATE product
        if (request.method === "POST") {

            const body = await request.json() as {
                name: string;
                description?: string;
                quantity: number;
                price: number;
                category?: string;
            };


            // Insert product
            const productResult = await pool
                .request()
                .input("name", body.name)
                .input("description", body.description ?? null)
                .input("quantity", body.quantity)
                .input("price", body.price)
                .input("category", body.category ?? null)
                .query(`
                    INSERT INTO Products
                    (Name, Description, Quantity, Price, Category)
                    OUTPUT INSERTED.*
                    VALUES
                    (@name, @description, @quantity, @price, @category)
                `);


            const product = productResult.recordset[0];


            // Create audit record
            await pool
                .request()
                .input("productId", product.Id)
                .input("action", "CREATED")
                .input(
                    "details",
                    `${product.Name} was created`
                )
                .query(`
                    INSERT INTO AuditLogs
                    (ProductId, Action, Details)
                    VALUES
                    (@productId, @action, @details)
                `);


            return {
                status: 201,
                jsonBody: product
            };
        }

        if (request.method === "PUT") {

    const id = Number(request.params.id);

    if (!id) {
        return {
            status: 400,
            jsonBody: {
                error: "Product ID is required"
            }
        };
    }

    const body = await request.json() as {
        name: string;
        description?: string;
        quantity: number;
        price: number;
        category?: string;
    };


    // Get old product before updating
    const oldProductResult = await pool
        .request()
        .input("id", id)
        .query(`
            SELECT *
            FROM Products
            WHERE Id = @id
        `);


    if (oldProductResult.recordset.length === 0) {
        return {
            status: 404,
            jsonBody: {
                error: "Product not found"
            }
        };
    }


    const oldProduct = oldProductResult.recordset[0];


    // Update product
    await pool
        .request()
        .input("id", id)
        .input("name", body.name)
        .input("description", body.description ?? null)
        .input("quantity", body.quantity)
        .input("price", body.price)
        .input("category", body.category ?? null)
        .query(`
            UPDATE Products
            SET
                Name = @name,
                Description = @description,
                Quantity = @quantity,
                Price = @price,
                Category = @category
            WHERE Id = @id
        `);


    // Create audit record
    await pool
        .request()
        .input("productId", id)
        .input("action", "UPDATED")
        .input(
            "details",
            `Product updated. Quantity: ${oldProduct.Quantity} -> ${body.quantity}`
        )
        .query(`
            INSERT INTO AuditLogs
            (
                ProductId,
                Action,
                Details
            )
            VALUES
            (
                @productId,
                @action,
                @details
            )
        `);


    // Return updated product
    const updatedProduct = await pool
        .request()
        .input("id", id)
        .query(`
            SELECT *
            FROM Products
            WHERE Id = @id
        `);


    return {
        status: 200,
        jsonBody: updatedProduct.recordset[0]
    };
}


        return {
            status: 405,
            jsonBody: {
                error: "Method not allowed"
            }
        };


    } catch (error) {

        context.error(error);

        return {
            status: 500,
            jsonBody: {
                error: error instanceof Error
                    ? error.message
                    : error
            }
        };
    }
}


app.http("Products", {
    methods: ["GET", "POST", "PUT"],
    authLevel: "anonymous",
    route: "products/{id:int?}",
    handler: Products
});