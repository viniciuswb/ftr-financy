import "reflect-metadata";
import { createApp } from "./app.js";
import { env } from "./env.js";

const app = await createApp();
app.listen(env.PORT, () => {
  console.log(`Server ready at http://localhost:${env.PORT}/graphql`);
});
