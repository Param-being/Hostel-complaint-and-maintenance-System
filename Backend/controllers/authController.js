const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER USER
exports.registerUser = async (req, res) => {
try {
const name = req.body.name;
const email = req.body.email;
const password = req.body.password;
const role = req.body.role;


const userExists = await User.findOne({ email: email });

if (userExists) {
  return res.status(400).json({ message: "User already exists" });
}

const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);

const user = await User.create({
  name: name,
  email: email,
  password: hashedPassword,
  role: role
});

return res.status(201).json({
  message: "User registered successfully",
  user: user
});


} catch (error) {
console.error(error);
return res.status(500).json({ message: error.message });
}
};

// LOGIN USER
exports.loginUser = async (req, res) => {
try {
const email = req.body.email;
const userPassword = req.body.password; // renamed


const user = await User.findOne({ email: email });

if (!user) {
  return res.status(400).json({ message: "Invalid email or password" });
}

const isMatch = await bcrypt.compare(userPassword, user.password);

if (!isMatch) {
  return res.status(400).json({ message: "Invalid email or password" });
}

const token = jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

// remove password safely
const { password, ...userData } = user._doc;

return res.status(200).json({
  message: "Login successful",
  token: token,
  user: userData
});


} catch (error) {
console.error(error);
return res.status(500).json({ message: error.message });
}
};
