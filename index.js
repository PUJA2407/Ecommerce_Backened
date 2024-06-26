const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

app.use(express.json());
app.use(cors());

// Database Connection with MongoDB
mongoose.connect("mongodb+srv://pujakumarioff24:project@cluster0.f8zjw90.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");


// API Creation
app.get("/", (req, res) => {
   res.send("Express App is Running");
});

// Image Storage Engine
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});



const upload = multer({ storage: storage });

// Creating Upload Endpoint for images
app.use('/images', express.static('upload/images'));

app.post("/upload", upload.single('product'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: 0, message: "No file uploaded" });
    }
    const imageUrl = `http://localhost:${port}/images/${req.file.filename}`;
    console.log("Constructed image URL:", imageUrl);
    res.json({
        success: 1,
        image_url: imageUrl
    });
});

//Schema for Creating  Products
const Product = mongoose.model("Product",{
    id:{
        type: Number,
        requrired:true,
    },
      name:{
        type: String,
        requrired:true,
      },
      image:{
        type: String,
        requrired:true,
      },
      category:{
        type: String,
        requrired:true,
      },
      new_price:{
        type: Number,
        requrired:true,
      },
      old_price:{
        type: Number,
        requrired:true,
      },
      date:{
        type: Date,
        default: Date.now,
      },
      available:{
        type: Boolean,
       default:true,
      },
})

app.post('/addproduct',async(req,res)=>{
    let products = await Product.find({});
    let id;
    if(products.length>0)
    {
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id+1;
    }
    else{
           id=1;
    }

    const product = new Product({
        id:id,
        name:req.body.name,
        image:req.body.image,
        category:req.body.category,
        new_price:req.body.new_price,
        old_price:req.body.old_price,
    });
    console.log(product);
    await product.save();
    console.log("Saved");
    res.json({
        success:true,
        name:req.body.name,
    })
})

// Creating API For deleting Products

app.post('/removeproduct',async (req,res)=>{
    await Product.findOneAndDelete({id:req.body.id});
      console.log("Removed");
      res.json({
        success:true,
        name:req.body.name
      })
})

// Creating API For getting All Products
app.get('/allproducts',async(req,res)=>{
    let products = await Product.find({});
    console.log("All Products Fetched");
    res.send(products);
})

// Schema creating for User Model

const Users = mongoose.model('Users',{
  name:{
    type:String,
  },
  email:{
    type:String,
    unique:true,
  },
  password:{
    type:String,
  },
  cartData:{
    type:Object,
  },
  date:{
        type:Date,
        default:Date.now,
  }
})

//Creating Endpoint for registering the users
// Login endpoint
app.post('/login', async (req, res) => {
  try {
      const user = await Users.findOne({ email: req.body.email });
      if (!user) {
          return res.json({ success: false, error: "Wrong Email Id" });
      }
      const passwordMatch = req.body.password === user.password;
      if (!passwordMatch) {
          return res.json({ success: false, error: "Wrong Password" });
      }
      const token = jwt.sign({ user: { id: user.id } }, 'secret_ecom');
      res.json({ success: true, token });
  } catch (error) {
      console.error(error);
      res.json({ success: false, error: "Internal Server Error" });
  }
});

// Signup endpoint
app.post('/signup', async (req, res) => {
  try {
      const existingUser = await Users.findOne({ email: req.body.email });
      if (existingUser) {
          return res.json({ success: false, error: "existing user found with same email address" });
      }
      const newUser = new Users({
          name: req.body.username,
          email: req.body.email,
          password: req.body.password,
          cartData: { ...Array.from({ length: 300 }, (_, i) => [i, 0]) }
      });
      await newUser.save();
      const token = jwt.sign({ user: { id: newUser.id } }, 'secret_ecom');
      res.json({ success: true, token });
  } catch (error) {
      console.error(error);
      res.json({ success: false, error: "Internal Server Error" });
  }
});


//creating endpoint for newcollection data
/*
app.get('/newcollections',async (req,res)=>{
    let products = await Product .find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("NewCollection Fetched");
    res.send(newcollection);
})
*/

app.listen(port, (error) => {
    if (!error) {
        console.log("Server Running on Port " + port);
    } else {
        console.log("Error : " + error);
    }
});

