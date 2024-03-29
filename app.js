const express = require("express");
const path = require("path");
const mongoose = require("mongoose")
const bcrypt = require("bcrypt");
const { render } = require("express/lib/response");
const { stringify } = require("querystring");
const { await } = require("await");

main().catch(err => console.log(err));
async function main() {
    await mongoose.connect('mongodb://localhost:27017/realocation');
}

const app = express();
const port = 8000;


const personSchema = new mongoose.Schema({
    username: String,
    email: { type: String, unique: true },
    password: String,
    confirmPassword: String,
    role:String,
    country:String
});
const Person = mongoose.model('Person', personSchema);

personSchema.pre('save', async function (next) {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)
        password = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }
})

app.use('/static', express.static('statics'))
app.use(express.urlencoded())


app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))




app.get('/', (req, res) => {
    res.status(200).render('main.pug');
})


app.get('/login', (req, res) => {
    res.status(200).render('index.pug');
})
app.get('/chat', (req, res) => {
    res.status(200).render('chats.pug');
})
app.get('/user', (req, res) => {
    res.status(200).render('profile.pug');
})

app.post('/login', async (req, res) => {

    try {

        const email = req.body.email;
        const password = req.body.password;

        const usermail = await Person.findOne({ email: email })
        console.log(usermail);
        const username= usermail.username
        console.log(username)
        const useremails=usermail.email
        const usercountry=usermail.country
        const roles=usermail.role
        if (await bcrypt.compare(password, usermail.password)) {
            
            if (usermail.role == 'Student') {
                res.status(200).render("dashboard.pug",
                {

                    userName:username,
                    userEmail:useremails,
                    userCountry:usercountry,
                    userRole:roles

                }) 
            } 
        }
        else {
            res.send("password are not matching");
        }

    } catch (error) {
        res.status(400).send("invalid email")
    }

})


app.get('/signup', (req, res) => {
    res.status(200).render('signup.pug');
})



app.post('/signup', async (req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.confirmPassword;

        if (password == cpassword) {
            const salt = await bcrypt.genSalt()
            const hashedpassword = await bcrypt.hash(password, salt)
            const hashedcpassword = await bcrypt.hash(cpassword, salt)
            
            const person = new Person({
                username: req.body.username,
                email: req.body.email,
                password: hashedpassword,
                confirmPassword: hashedcpassword,
                role:req.body.opt,
                country:req.body.country
            })
            const registered = await person.save()
            res.status(200).render("index.pug")
        }
        else {
            

            res.send("password not match")
        }
    } catch (error) {
        res.status(400).send(error);
    }
})

app.get('/community', (req, res) => {
    res.status(200).render('community.pug',Ids="");
})
app.get('/mover', (req, res) => {
    res.status(200).render('movers.pug');
})
app.get('/rental', (req, res) => {
    res.status(200).render('rental.pug');
})
app.get('/visa', (req, res) => {
    res.status(200).render('visa.pug');
})


app.post('/search', async (req, res) => {

    

        const searched = req.body.search;
       
        const ids = await Person.find({ country:searched })

            res.render('community.pug',{
                Ids:ids
            }
            )

})
app.get('/logout', function(req, res) {
      res.redirect('/login');
    
  });


app.listen(port, () => {
    console.log(`The application started successfully on port ${port}`);
});