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
    const collectionallproperty = db.collection('all-property');

    // ================= HOME =================
    app.get("/", (req: Request, res: Response) => {
      res.send("Server is running!");
    });

    // ====================== get All active property by query ==========================
    app.get('/api/all-properties', async (req: Request, res: Response) => {

      const query: Record<string, unknown> = {};

      if (req.query.isActive) {
        query.isActive = req.query.isActive;
      }

      // Featured
      if (req.query.featured !== undefined) {
        query.featured = req.query.featured === "true";
      }

      if (req.query.search) {
        query.title = { $regex: String(req.query.search), $options: "i", };
      }

      if (req.query.type && req.query.type !== "all") {
        query.category = {
          $regex: `^${String(req.query.type)}$`,
          $options: "i",
        }
      };

      let sortOption: Record<string, 1 | -1> = {
        createdAt: -1,
      };

      if (req.query.sort === "low-high") {
        sortOption = { price: 1 };
      }

      if (req.query.sort === "high-low") {
        sortOption = { price: -1 };
      }

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 12;

      const skip = (page - 1) * limit;
      const total = await collectionallproperty.countDocuments(query);

      const cursor = collectionallproperty
        .find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)

      const result = await cursor.toArray();
      res.send({
        data: result,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      });
    })


    // ================== Details Page API ================

    app.get("/api/properties/:id", async (req, res) => {
      try {
        const { id } = req.params;

        const property = await collectionallproperty.findOne({
          _id: new ObjectId(id),
        });

        if (!property) {
          return res.status(404).send({
            message: "Property not found",
          });
        }

        res.send(property);

      } catch (error) {
        res.status(500).send({
          message: "Failed to get property details",
        });
      }
    });

    //=================== add property aip ======================
    app.post('/api/addproperty', async (req: Request, res: Response) => {
      const addProperty = req.body;
      const result = await collectionallproperty.insertOne(addProperty)
      res.send(result);
    }
    )

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error(error);
  }
}

run().catch(console.error);

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});