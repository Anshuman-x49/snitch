import app from "./app/app.js";
import config from "./config/config.js";
import { connectDB } from "./config/db.js";

await connectDB();

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});