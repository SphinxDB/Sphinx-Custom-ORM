const mongoose = require("mongoose");

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
    } catch (err) {
      console.error("Error adding user:", err);
    } finally {
      db.close();
    }
  }
  async function updateUser(userId, newBalance) {
    try {
      const existingUser = await User.findOne({ UserId: userId });

      if (existingUser) {
        let userObj0 = existingUser.toObject({
          getters: false,
          virtuals: false,
        });

        delete userObj0._id;

        console.log("Existing user data :", userObj0);

        existingUser.balance = newBalance;
        const updatedUser = await existingUser.save();

        console.log("User updated successfully.");
        let userObj1 = updatedUser.toObject({
          getters: false,
          virtuals: false,
        });

        delete userObj1._id;

        console.log("Updated user data :", userObj1);
      } else {
        console.log("User not found.");
      }
    } catch (err) {
      console.error("Error updating user:", err);
    } finally {
      db.close();
    }
  }

  async function deleteUser(userId) {
    try {
      const deletedUser = await User.findOneAndDelete({ UserId: userId });

      if (deletedUser) {
        console.log("User deleted successfully.");
        let usetObj = deletedUser.toObject({ getters: false, virtuals: false });
        delete usetObj._id;
        console.log("Deleted user data:", usetObj);
      } else {
        console.log("User not found.");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    } finally {
      db.close();
    }
  }
  //addUser("12345", 100);
  //deleteUser("12345");

  //updateUser("12345", 200);
});
