import "dotenv/config";
import app from "./app";

const port = Number(process.env.API_PORT ?? 4000);

app.listen(port, () => {
  console.log(`Express API listening on http://localhost:${port}`);
});
