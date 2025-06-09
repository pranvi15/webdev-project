if (process.env.NODE_ENV != "production") {
  require('dotenv').config();
}

const express=require("express");
const bodyParser=require("body-parser");
const app=express();
//const mysql=require('mysql2');
const path = require("path");
const methodOverride = require('method-override');
const port=process.env.PORT||3000;


app.set('views',path.join(__dirname,'/views'));
app.set('view engine','ejs');
app.use(express.json());
app.use(methodOverride('_method'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}));
//app.use(express.urlencoded());


//Database Connection
const mongoose =require("mongoose");
mongoose.connect("mongodb://0.0.0.0:27017/SCCS",{
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const Register = require("./models/register");
const Download=require('./models/downloads');

app.use("/styles",express.static(__dirname + "/styles"));

//
// const { isLoggedIn, isAuthor, catchAsyncError, isReviewOwner, validateEvent} = require('./middleware');


//Controllers
const placeController = require('./controllers/places');

// FOR IMAGES
const multer = require('multer');
// const upload = multer({dest: 'uploads/'});
const { storage } = require('./cloudinary/index');
const upload = multer({ storage }); // now instead of storing locally we store in cloudinary storage
const cloudinary = require('cloudinary');


const {catchAsyncError} = require('./middleware');

//

app.get("/",(req,res)=>{
    res.render("home");
});

app.get("/home",(req,res)=>{
  res.render("home");
});
app.get("/ulogin",(req,res)=>{
    res.render("ulogin");
  });

  app.post('/ulogin',(req,res)=>{
    res.redirect("usercat");
  });


  
  app.get('/usershow/:id', catchAsyncError(placeController.ushowParticularPlace));

//   app.post('/ulogin',(req,res)=>{
//       res.redirect("/catalouge");
//     });

  app.get("/alogin",(req,res)=>{
    res.render("alogin");
  });

  app.post('/alogin',(req,res)=>{
    res.redirect("cat");
  });

  // app.get("/cat",(req,res)=>{
  //   res.render("cat");
  // });

  // app.get("/add",(req,res)=>{
  //   res.render("add");
  // });

  app.get('/cat',  catchAsyncError(placeController.showAll));
  app.get('/usercat',  catchAsyncError(placeController.ushowAll));

  app.get('/add', placeController.addPlaceForm);

  app.post('/add',  upload.array('images'), catchAsyncError(placeController.addPlaceDB));

  app.get('/show/:id', catchAsyncError(placeController.showParticularPlace));

// UPDATE FORM
app.get('/place/:id',  catchAsyncError(placeController.updateForm));

// UPDATE IN DB
app.put('/place/:id',  upload.array('images'),catchAsyncError(placeController.updateInDB));

// DELETE PLACE
app.delete('/place/:id',   catchAsyncError(placeController.deletePlace));

  app.get("/register",(req,res)=>{
    res.render("register");
  });

  app.post("/register" , async (req,res)=>{
    try{

        const password = req.body.password
        const cpassword = req.body.confirmpassword
        console.log(req.body.password);
        console.log(req.body.confirmpassword);
        //Collecting data from register.hbs and writing to MongoDB database Registration.registers
        if(password === cpassword){
            const registerUser = new Register({
                username : req.body.username,
                password : req.body.password
            })

        const registered = await registerUser.save()
        res.status(201).render("ulogin")
        }else{
            res.send("Passwords are not matching")
        }
    } catch( error){
        res.status(400).send(error);
    }
})

app.post('/clickdownoad/:id',async(req,res)=>{
  const {id}=req.params;
  console.log(id);
  console.log("ok");
  const exist= await Download.findOne({Numberofdownloads:'Numberofdownloads'});
  if(!exist) {
      const newobj= new Download({
     Numberofdownloads:'Numberofdownloads',
     downloads :0
    });
  await newobj.save();
  }
  exist.downloads+=1;
  exist.save();
  const num=exist.downloads;
  const url='/show/'+id.substring(1,id.length);
  res.redirect(url);
})

app.listen(port,()=>{
    console.log(`Server listening at port ${port}`);
})