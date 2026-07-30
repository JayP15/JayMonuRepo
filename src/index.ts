import "dotenv/config";
import { app } from "@azure/functions";

import "./functions/Health";
import "./functions/Inventory";

app.setup({
    enableHttpStream: true,
});