import express, { Request, Response } from "express";

import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import { verifyToken } from "./verifyJwt";


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
    const inActiveCollection = db.collection('inActive');
    const wishlistCollection = db.collection('wishlist');
    const userCollection = db.collection('user');

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

      console.log("Total:", total);
      console.log(result.map((item) => ({
        title: item.title,
        isActive: item.isActive,
      })));

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

    // ===================== my properties page ==================
    app.get("/api/my-properties/:email", verifyToken, async (req: Request, res: Response) => {
      const { email } = req.params;

      const result = await collectionallproperty
        .find({ userEmail: email })
        .sort({ _id: -1 })
        .toArray();

      res.send(result);
    });

    //=================== add property aip ======================
    app.post('/api/addproperty', verifyToken, async (req: Request, res: Response) => {
      const addProperty = req.body;
      const result = await inActiveCollection.insertOne(addProperty)
      res.send(result);
    })

    //=============== delete my property ============
    app.delete("/api/property/:id", verifyToken, async (req: Request, res: Response) => {
      const id = req.params.id as string;
      const result = await collectionallproperty.deleteOne({
        _id: new ObjectId(id),
      });

      res.send(result);
    });

    //================= wishlist ===================
    app.post("/api/wishlist", verifyToken, async (req: Request, res: Response) => {
      const { propertyId, userEmail } = req.body;

      const exists = await wishlistCollection.findOne({
        propertyId,
        userEmail,
      });

      if (exists) {
        return res.status(400).send({
          message: "Already saved",
        });
      }

      const result = await wishlistCollection.insertOne({
        propertyId,
        userEmail,
        createdAt: new Date(),
      });

      res.send(result);
    });

    app.get("/api/wishlist/:email", verifyToken, async (req: Request, res: Response) => {
      const { email } = req.params;

      const result = await wishlistCollection
        .find({ userEmail: email })
        .toArray();

      res.send(result);
    });

    // Delete wishlist
    app.delete("/api/wishlist", verifyToken, async (req: Request, res: Response) => {
      const { propertyId, userEmail } = req.body;

      const result = await wishlistCollection.deleteOne({
        propertyId,
        userEmail,
      });

      if (result.deletedCount === 0) {
        return res.status(404).send({
          message: "Wishlist item not found",
        });
      }

      res.send({
        message: "Removed from wishlist",
      });
    });

    app.get("/api/wishlist/properties/:email", verifyToken, async (req: Request, res: Response) => {
      const { email } = req.params;

      const wishlist = await wishlistCollection.find({
        userEmail: email,
      }).toArray();

      const propertyIds = wishlist.map(
        (item) => new ObjectId(item.propertyId)
      );

      const properties = await collectionallproperty.find({
        _id: { $in: propertyIds },
      }).toArray();

      res.send(properties);
    });

    //=============== all user get ====================
    app.get('/api/user', verifyToken, async (req: Request, res: Response) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    })

    //=============== inactive properties get ====================
    app.get('/api/inactive', verifyToken, async (req: Request, res: Response) => {
      const users = await inActiveCollection.find().toArray();
      res.send(users);
    })

    // Accept Property
    app.patch("/api/property/accept/:id", verifyToken, async (req: Request, res: Response) => {
      const id = req.params.id as string;

      const property = await inActiveCollection.findOne({
        _id: new ObjectId(id),
      });

      if (!property) {
        return res.status(404).send({
          message: "Property not found",
        });
      }

      const { _id, ...propertyData } = property;

      await collectionallproperty.insertOne({
        ...propertyData,
        isActive: "active",
      });

      await inActiveCollection.deleteOne({
        _id: new ObjectId(id),
      });

      res.send({
        success: true,
        message: "Property approved successfully",
      });
    });

    app.delete("/api/property/reject/:id", verifyToken, async (req: Request, res: Response) => {
      const id = req.params.id as string;

      const result = await inActiveCollection.deleteOne({
        _id: new ObjectId(id),
      });

      if (result.deletedCount === 0) {
        return res.status(404).send({
          success: false,
          message: "Property not found",
        });
      }

      res.send({
        success: true,
        message: "Property rejected successfully",
      });
    });


    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error(error);
  }
}

run().catch(console.error);

app.listen(port, () => {
  // console.log(`Server running on http://localhost:${port}`);
});