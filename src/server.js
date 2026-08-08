import app from "./app.js";
import connectDB from "./config/db.js";

connectDB();

app.listen(3001, () => {
    console.log(" 🔊 Server is running on port http://localhost3001")
})