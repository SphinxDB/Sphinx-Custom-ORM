const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

app.use(cors());
mongoose.connect("mongodb://localhost:27017/test", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

db.once("open", () => {
  console.log("MongoDB connection successful.");

  const userSchema = new mongoose.Schema(
    {
      UserId: {
        type: String,
        required: true,
        unique: true,
      },
      balance: {
        type: Number,
        required: true,
      },
    },
    { versionKey: false }
  );

  const User = mongoose.model("User", userSchema);
  async function addUser(userId, userBalance) {
    let result = {
      currentState: {},
      query: {
        operation: "insert",
        field: "user",
        newData: {
          UserId: userId,
          balance: userBalance,
        },
      },
      afterState: null,
    };

    try {
      const newUser = new User({
        UserId: userId,
        balance: userBalance,
      });

      const savedUser = await newUser.save();
      let userObj = savedUser.toObject({ getters: false, virtuals: false });
      console.log("User added successfully.");
      delete userObj._id;
      console.log("Added user data:", userObj);

      result.afterState = userObj;

      return result;
    } catch (err) {
      console.error("Error adding user:", err);
      return { ...result, error: err };
    } finally {
      //db.close();
    }
  }

  async function updateUser(userId, newBalance) {
    let result = {
      currentState: null,
      query: {
        operation: "update",
        field: "balance",
        newData: newBalance,
      },
      afterState: null,
    };

    try {
      const existingUser = await User.findOne({ UserId: userId });

      if (existingUser) {
        let userObj0 = existingUser.toObject({
          getters: false,
          virtuals: false,
        });

        delete userObj0._id;

        console.log("Existing user data :", userObj0);

        // currentState güncelleme
        result.currentState = userObj0;

        existingUser.balance = newBalance;
        const updatedUser = await existingUser.save();

        console.log("User updated successfully.");
        let userObj1 = updatedUser.toObject({
          getters: false,
          virtuals: false,
        });

        delete userObj1._id;

        console.log("Updated user data :", userObj1);

        // afterState güncelleme
        result.afterState = userObj1;
      } else {
        console.log("User not found.");
      }
    } catch (err) {
      console.error("Error updating user:", err);
      result.error = err;
    } finally {
      //db.close();
    }

    return result;
  }

  async function deleteUser(userId) {
    let result = {
      currentState: null,
      query: {
        operation: "delete",
        field: "user",
        userId: userId,
      },
      afterState: {},
    };

    try {
      const deletedUser = await User.findOneAndDelete({ UserId: userId });

      if (deletedUser) {
        console.log("User deleted successfully.");
        let userObj = deletedUser.toObject({ getters: false, virtuals: false });
        delete userObj._id;
        console.log("Deleted user data:", userObj);

        // currentState güncelleme
        result.currentState = userObj;
      } else {
        console.log("User not found.");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      result.error = err;
    } finally {
      db.close();
    }

    return result;
  }

  app.get("/addUser", async (req, res) => {
    const userId = req.query.userId || "12345";
    const userBalance = req.query.userBalance || 100;

    try {
      const result = await addUser(userId, userBalance);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: "Error adding user", error });
    }
  });

  app.get("/updateUser", async (req, res) => {
    const userId = req.query.userId || "12345";
    const newBalance = req.query.newBalance || 200;

    try {
      const result = await updateUser(userId, newBalance);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: "Error updating user", error });
    }
  });

  app.get("/deleteUser", async (req, res) => {
    const userId = req.query.userId || "12345";

    try {
      const result = await deleteUser(userId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: "Error deleting user", error });
    }
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
