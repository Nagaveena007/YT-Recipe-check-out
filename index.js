const cors = require("cors");
const express = require("express");
const stripe = require("stripe")(
  "sk_test_51KSjz0EcIioZXTXKQqw0hIPFX12u5yV43WREojOzvNigiQ174N0PEp5cQBvXzYKrmcksVl8yb3HUlnICmWfHfpuT00CmOPfQc8"
);
const uuid = require("uuid/v4");

const app = express();

app.use(express.json());
app.use(cors());

app.get("/test", async (req, res) => {
  res.send({ message: "test success" });
});

app.get("/", (req, res) => {
  res.send("Add your Stripe Secret Key to the .require('stripe') statement!");
});

app.post("/checkout", async (req, res) => {
  // res.send("Add your Stripe Secret Key to the .require('stripe') statement!");

  console.log("Request:", req.body);

  let error;
  let status;
  try {
    const { toal_payment, token, cartList } = req.body;

    const customer = await stripe.customers.create({
      email: token.email,
      source: token.id,
    });

    const idempotency_key = uuid();
    const charge = await stripe.charges.create(
      {
        amount: toal_payment * 100,
        currency: "usd",
        customer: customer.id,
        receipt_email: token.email,
        /* description: `Purchased the ${cartList.}`, */
        shipping: {
          name: token.card.name,
          cart: {
            productName: cartList.name,
            price: cartList.price,
          },
          address: {
            line1: token.card.address_line1,
            line2: token.card.address_line2,
            city: token.card.address_city,
            country: token.card.address_country,
            postal_code: token.card.address_zip,
          },
        },
      },
      {
        idempotency_key,
      }
    );
    console.log("Charge:", { charge });
    status = "success";
  } catch (error) {
    console.error("Error:", error);
    status = "failure";
  }

  res.json({ error, status });
});

app.listen(8080, () => {
  console.log("Server is running on port ", 8080);
});
