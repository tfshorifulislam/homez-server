import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

dotenv.config();

const app = express();
const port: number = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

// ================= MONGODB =================
const uri = process.env.MONGODB_CONNECTION!;

if (!uri) {
  throw new Error("MONGODB_CONNECTION is missing in .env");
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// ================= MAIN RUN =================

async function run(): Promise<void> {
  try {
    // await client.connect();

    const db = client.db("homez");
    const collectionallitems = db.collection('all-items');

    // ================= HOME =================
    app.get("/", (req: Request, res: Response) => {
      res.send("Server is running!");
    });




    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error(error);
  }
}

run().catch(console.error);

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});