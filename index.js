// customer id....,  
// const Publishable_Key = "pk_test_51MXIFVSA3Bsr7pYKtd0SunAa1usqXnY8TuARlhKl2RaCHlBdtHGFtPv9vp3wb32adTSZMBDM8ZuvAWgZHKDgNQB50002rNEuYm";
const Secret_Key = "sk_test_51MXIFVSA3Bsr7pYKCirMJuQErQFMhqH2ywZXAoH1aNOgFd72jW0lnu1jPDFzTeBNtEW2010Xay52pJMvuQwD3khj004VOSRXq4";
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const stripe = require('stripe')(Secret_Key);
const Customer = require("./models/Customer.js");
const mongoose = require("mongoose");


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.set("strictQuery", false);  // for removing Deprecation Warning in the console...


mongoose.connect("mongodb://localhost:27017", {
    useUnifiedTopology: true, useNewUrlParser: true
},
    () => console.log("Successfully Connected to db")
);


app.get('/', async (req, res) => {
    res.send("WELCOME TO PAYMENT GATEWAY (STRIPE...)");
})


app.post('/payment', async (req, res) => {

    const userdata = await Customer.findOne({ email: req.body.email });
    if (userdata) {
        res.send({ "message": "Customer is in our database. " });
    }
    else {
        try {
            console.log("customer is running...")
            const customer = await stripe.customers.create({
                name: req.body.name,
                email: req.body.email,
            });
            console.log("customer is running...")
            if (customer) {
                const token = await stripe.tokens.create({
                    card: {
                        number: req.body.card_number,
                        exp_month: req.body.exp_month,
                        exp_year: req.body.exp_year,
                        cvc: req.body.cvc,
                    },
                });
                // console.log("token ====== ", token);
                if (token) {
                    const card = await stripe.customers.createSource(
                        customer.id,
                        { source: token.id }
                    );

                    // console.log("card ===== ",card)
                    if (card) {
                        const user = new Customer({
                            name: customer.name,
                            email: customer.email,
                            customerId: customer.id,
                            tokenId : token.id,
                            cardId: card.id,
                            isDeleted: req.body.isDeleted
                        });

                        const savedCustomer = await user.save();
                        res.send({
                            "message": "customer created successfully. ",
                            "Customer detail in mongoDB": savedCustomer,
                            "Customer Details in STRIPE": customer,
                            "token Details at STRIPE": token,
                            "Card Details at STRIPE": card,
                        })
                    }
                }
            }
            else {
                res.send({ "message": "customer is not created..." });
            }

        } catch (error) {
            res.status(400).send(error);
        }
    }
});

app.listen(3000, () => {
    console.log('Payment gateway integration server listening on port 3000!');
});



