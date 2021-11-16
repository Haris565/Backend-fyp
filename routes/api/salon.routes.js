const router = require('express').Router()
const auth = require("../../middleware/auth");
const salonController = require ("../../Controller/salon.controller")


router.get("/", auth , salonController.getAuth)
router.get("/getAllAppointments", salonController.getAllAppointments);
router.get("/getCounts", salonController.getCounts);
router.post("/login", salonController.validateData("loginSalon"), salonController.salonLogin)
router.post("/signup", salonController.validateData("signupSalon"), salonController.salonSignup),
router.post("/setProfile", auth, salonController.profile),
router.get("/getProfile",auth, salonController.getProfile),
router.post("/resetPassword", salonController.resetPassword)
router.post("/newPassword", salonController.newPassword)
router.post("/uploader", salonController.uploader)
router.post('/checkout',salonController.checkingCheckout);
router.post("/customerPortal", auth, salonController.customerPortal);
router.post( 
    "/webhook",
    async (request, response) => {
      const event = request.body;
      // Handle the event
      switch (event.type) {
        case "checkout.session.completed":
          const paymentIntent = event.data.object;
          // Then define and call a method to handle the successful payment intent.
          // handlePaymentIntentSucceeded(paymentIntent);
        //   const paymentStatus = paymentIntent.payment_status;
        //   const customerID = paymentIntent.customer;
        //   const checkoutID = paymentIntent.id;
        //   try {
        //     const checkoutData = await checkoutSchema.find({
        //       checkoutID: checkoutID,
        //     });
  
        //     const subscriptionData = await new subscriptionSchema({
        //       checkoutID: checkoutData[0]._id,
        //       userID: checkoutData[0].userID,
        //       customerID: customerID,
        //     }).save();
        console.log(paymentIntent)
  
        //     console.log("first", subscriptionData);
        //     // var subscriptionSchemaID = subscriptionData._id;
        //   } catch (err) {
        //     console.log(err);
        //   }
  
          break;
  
        case "customer.subscription.created":
          const subscription = event.data.object;
          console.log(subscription);
        //   const startDate = subscription.current_period_start;
        //   const endDate = subscription.current_period_end;
        //   const subscriptionID = subscription.id;
        //   const status = subscription.status;
  
        //   try {
        //     // console.log(subscription);
        //     const getObjectID = await subscriptionSchema.find({
        //       customerID: subscription.customer,
        //     });
        //     const subID = getObjectID[0]._id;
  
        //     const UserID = getObjectID[0].userID;
  
        //     const updateUser = await UserSchema.updateOne(
        //       { _id: UserID },
        //       {
        //         $set: {
        //           subscribed: true,
        //           subscriptionID: subscriptionID,
        //         },
        //       }
        //     );
  
        //     console.log("userUpdated", updateUser);
  
        //     const updatedSubscription = await subscriptionSchema.updateOne(
        //       {
        //         _id: subID,
        //       },
        //       {
        //         $set: {
        //           subscriptionID: subscriptionID,
        //           periodStart: startDate,
        //           periodEnd: endDate,
        //           status: status,
        //         },
        //       }
        //     );
        //     console.log("second", updatedSubscription);
        //   } catch (err) {
        //     console.log(err);
        //   }
          break;
  
        case "customer.subscription.updated":
  
          let res = event.data.object;
          console.log(res)
        //   try{
        //     let getSubscriptionData = await subscriptionSchema.find({
        //       customerID: res.customer,
        //     });
        //     let subcripID = getSubscriptionData[0]._id;
  
        //     let upDateSubscription = await subscriptionSchema.updateOne(
        //       {
        //         _id: subcripID,
        //       },
        //       {
        //         $set: {
        //           periodEnd: res.current_period_end,
        //           status: res.status,
        //         },
        //       }
        //     );
        //     console.log("updated", upDateSubscription);
        //   }
        //   catch(err){
        //     console.log(err.msg)
        //   }
  
          break;
  
        case "customer.subscription.deleted":
          const deletedData = event.data.object;
          console.log(deletedData);
        //   try{
        //     let getSubsData = await subscriptionSchema.find({
        //       customerID: deletedData.customer,
        //     });
        //     let getSubcripID = getSubsData[0]._id;
  
        //     let deletedSubscriptionData = await subscriptionSchema.updateOne(
        //       {
        //         _id: getSubcripID,
        //       },
        //       {
        //         $set: {
        //           periodEnd: deletedData.current_period_end,
        //           status: deletedData.status,
        //         },
        //       }
        //     );
        //     console.log("deleted", deletedSubscriptionData);
        //   }
        //   catch(err){
        //     console.log(err)
        //   }
          
          break;
  
        default:
          console.log(`Unhandled event type ${event.type}`);
          break;
      }
  
      // Return a response to acknowledge receipt of the event
      response.json({ received: true });
    }
  );
module.exports= router;
