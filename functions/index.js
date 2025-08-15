const {setGlobalOptions} = require("firebase-functions");
const {onCall} = require("firebase-functions/v2/https");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");

admin.initializeApp();
setGlobalOptions({ maxInstances: 10 });

const db = admin.firestore();

exports.transferCredits = onCall({
  cors: true,
  region: "us-central1",
}, async (request) => {
  const {amount, recipientUserId} = request.data;
  const senderUid = request.auth?.uid;

  if (!senderUid) {
    throw new Error("Authentication required");
  }

  if (!amount || !recipientUserId || amount <= 0) {
    throw new Error("Invalid transfer parameters");
  }

  if (senderUid === recipientUserId) {
    throw new Error("Cannot transfer credits to yourself");
  }

  try {
    const result = await db.runTransaction(async (transaction) => {
      const senderRef = db.collection("users").doc(senderUid);
      const recipientRef = db.collection("users").doc(recipientUserId);

      const senderDoc = await transaction.get(senderRef);
      const recipientDoc = await transaction.get(recipientRef);

      if (!senderDoc.exists || !recipientDoc.exists) {
        throw new Error("User not found");
      }

      const senderData = senderDoc.data();
      const recipientData = recipientDoc.data();

      if ((senderData.credits || 0) < amount) {
        throw new Error("Insufficient credits");
      }

      const newSenderCredits = (senderData.credits || 0) - amount;
      const newRecipientCredits = (recipientData.credits || 0) + amount;

      const timestamp = new Date().toISOString();
      const transactionId = Date.now().toString();

      const senderTransaction = {
        id: transactionId,
        type: "transfer",
        amount: amount,
        fromUserId: senderUid,
        toUserId: recipientUserId,
        timestamp: timestamp,
        description: `Credit transfer to ${recipientUserId}`,
      };

      const recipientTransaction = {
        id: transactionId + "_received",
        type: "received",
        amount: amount,
        fromUserId: senderUid,
        toUserId: recipientUserId,
        timestamp: timestamp,
        description: `Credits received from ${senderUid}`,
      };

      transaction.update(senderRef, {
        credits: newSenderCredits,
        transactionHistory: admin.firestore.FieldValue.arrayUnion(senderTransaction),
      });

      transaction.update(recipientRef, {
        credits: newRecipientCredits,
        transactionHistory: admin.firestore.FieldValue.arrayUnion(recipientTransaction),
      });

      return {success: true, newBalance: newSenderCredits};
    });

    logger.info("Credit transfer completed", {
      from: senderUid,
      to: recipientUserId,
      amount: amount,
    });

    return result;
  } catch (error) {
    logger.error("Credit transfer failed", error);
    throw new Error(error.message);
  }
});

exports.purchaseProduct = onCall({
  cors: true,
  region: "us-central1",
}, async (request) => {
  const {productId} = request.data;
  const buyerUid = request.auth?.uid;

  if (!buyerUid) {
    throw new Error("Authentication required");
  }

  if (!productId) {
    throw new Error("Product ID required");
  }

  try {
    const result = await db.runTransaction(async (transaction) => {
      const buyerRef = db.collection("users").doc(buyerUid);
      const productRef = db.collection("creator_forms").doc(productId);

      const buyerDoc = await transaction.get(buyerRef);
      const productDoc = await transaction.get(productRef);

      if (!buyerDoc.exists || !productDoc.exists) {
        throw new Error("Buyer or product not found");
      }

      const buyerData = buyerDoc.data();
      const productData = productDoc.data();

      if (productData.status !== "approved") {
        throw new Error("Product not available for purchase");
      }

      const price = productData.productPrice || 0;

      if (price > 0 && (buyerData.credits || 0) < price) {
        throw new Error("Insufficient credits");
      }

      const creatorRef = db.collection("users").doc(productData.creatorId);
      const creatorDoc = await transaction.get(creatorRef);

      if (!creatorDoc.exists) {
        throw new Error("Creator not found");
      }

      const creatorData = creatorDoc.data();
      const timestamp = new Date().toISOString();
      const transactionId = Date.now().toString();

      const purchaseRecord = {
        productId: productId,
        productTitle: productData.productTitle,
        creatorId: productData.creatorId,
        creatorName: productData.creatorName,
        price: price,
        timestamp: timestamp,
        productFiles: productData.productFiles || [],
      };

      const buyerTransaction = {
        id: transactionId,
        type: "purchase",
        amount: price,
        productId: productId,
        productTitle: productData.productTitle,
        timestamp: timestamp,
        description: `Purchased ${productData.productTitle}`,
      };

      const creatorTransaction = {
        id: transactionId + "_sale",
        type: "sale",
        amount: price,
        productId: productId,
        productTitle: productData.productTitle,
        buyerId: buyerUid,
        timestamp: timestamp,
        description: `Sale of ${productData.productTitle}`,
      };

      transaction.update(buyerRef, {
        credits: (buyerData.credits || 0) - price,
        purchaseHistory: admin.firestore.FieldValue.arrayUnion(purchaseRecord),
        transactionHistory: admin.firestore.FieldValue.arrayUnion(buyerTransaction),
      });

      transaction.update(creatorRef, {
        credits: (creatorData.credits || 0) + price,
        transactionHistory: admin.firestore.FieldValue.arrayUnion(creatorTransaction),
      });

      transaction.update(productRef, {
        purchaseCount: admin.firestore.FieldValue.increment(1),
      });

      return {
        success: true,
        newBalance: (buyerData.credits || 0) - price,
        productFiles: productData.productFiles || [],
      };
    });

    logger.info("Product purchase completed", {
      buyer: buyerUid,
      product: productId,
    });

    return result;
  } catch (error) {
    logger.error("Product purchase failed", error);
    throw new Error(error.message);
  }
});

exports.processReferral = onCall({
  cors: true,
  region: "us-central1",
}, async (request) => {
  const {referralCode} = request.data;
  const newUserUid = request.auth?.uid;

  if (!newUserUid) {
    throw new Error("Authentication required");
  }

  if (!referralCode) {
    throw new Error("Referral code required");
  }

  try {
    const usersQuery = await db.collection("users")
        .where("referralCode", "==", referralCode)
        .limit(1)
        .get();

    if (usersQuery.empty) {
      throw new Error("Invalid referral code");
    }

    const referrerDoc = usersQuery.docs[0];
    const referrerUid = referrerDoc.id;

    if (referrerUid === newUserUid) {
      throw new Error("Cannot use your own referral code");
    }

    const result = await db.runTransaction(async (transaction) => {
      const newUserRef = db.collection("users").doc(newUserUid);
      const referrerRef = db.collection("users").doc(referrerUid);

      const newUserDoc = await transaction.get(newUserRef);
      const currentReferrerDoc = await transaction.get(referrerRef);

      if (!newUserDoc.exists) {
        throw new Error("New user not found");
      }

      const newUserData = newUserDoc.data();

      if (newUserData.referredBy) {
        throw new Error("User already used a referral code");
      }

      const signupBonus = 25;
      const timestamp = new Date().toISOString();

      const referralRecord = {
        referredUserId: newUserUid,
        timestamp: timestamp,
        signupBonus: signupBonus,
        credited: false,
      };

      const newUserTransaction = {
        id: Date.now().toString(),
        type: "earned",
        amount: signupBonus,
        timestamp: timestamp,
        description: "Welcome bonus for using referral code",
      };

      transaction.update(newUserRef, {
        credits: (newUserData.credits || 0) + signupBonus,
        referredBy: referrerUid,
        transactionHistory: admin.firestore.FieldValue.arrayUnion(newUserTransaction),
      });

      transaction.update(referrerRef, {
        referralHistory: admin.firestore.FieldValue.arrayUnion(referralRecord),
        totalReferrals: admin.firestore.FieldValue.increment(1),
        pendingReferralCredits: admin.firestore.FieldValue.increment(50),
      });

      return {success: true, bonusCredits: signupBonus};
    });

    logger.info("Referral processed", {
      referrer: referrerUid,
      newUser: newUserUid,
      code: referralCode,
    });

    return result;
  } catch (error) {
    logger.error("Referral processing failed", error);
    throw new Error(error.message);
  }
});

exports.creditReferralReward = onDocumentCreated(
    "users/{userId}/purchaseHistory/{purchaseId}",
    async (event) => {
      const purchaseData = event.data?.data();
      const buyerUid = event.params.userId;

      if (!purchaseData || !buyerUid) {
        return;
      }

      try {
        const buyerRef = db.collection("users").doc(buyerUid);
        const buyerDoc = await buyerRef.get();

        if (!buyerDoc.exists) {
          return;
        }

        const buyerData = buyerDoc.data();
        const referrerUid = buyerData.referredBy;

        if (!referrerUid) {
          return;
        }

        await db.runTransaction(async (transaction) => {
          const referrerRef = db.collection("users").doc(referrerUid);
          const currentReferrerDoc = await transaction.get(referrerRef);

          if (!currentReferrerDoc.exists) {
            return;
          }

          const referrerData = currentReferrerDoc.data();
          const referralHistory = referrerData.referralHistory || [];

          const referralRecord = referralHistory.find(
              (ref) => ref.referredUserId === buyerUid && !ref.credited
          );

          if (!referralRecord) {
            return;
          }

          const referralReward = 50;
          const timestamp = new Date().toISOString();

          referralRecord.credited = true;
          referralRecord.creditedAt = timestamp;

          const referrerTransaction = {
            id: Date.now().toString(),
            type: "earned",
            amount: referralReward,
            timestamp: timestamp,
            description: `Referral reward for ${buyerUid}'s first purchase`,
          };

          transaction.update(referrerRef, {
            credits: admin.firestore.FieldValue.increment(referralReward),
            creditsFromReferrals: admin.firestore.FieldValue.increment(referralReward),
            pendingReferralCredits: admin.firestore.FieldValue.increment(-referralReward),
            referralHistory: referralHistory,
            transactionHistory: admin.firestore.FieldValue.arrayUnion(referrerTransaction),
          });
        });

        logger.info("Referral reward credited", {
          referrer: referrerUid,
          buyer: buyerUid,
          reward: 50,
        });
      } catch (error) {
        logger.error("Failed to credit referral reward", error);
      }
    }
);

exports.validatePurchaseAccess = onCall({
  cors: true,
  region: "us-central1",
}, async (request) => {
  const {productId} = request.data;
  const userUid = request.auth?.uid;

  if (!userUid) {
    throw new Error("Authentication required");
  }

  try {
    const userRef = db.collection("users").doc(userUid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error("User not found");
    }

    const userData = userDoc.data();
    const purchaseHistory = userData.purchaseHistory || [];

    const hasPurchased = purchaseHistory.some(
        (purchase) => purchase.productId === productId
    );

    return {hasPurchased};
  } catch (error) {
    logger.error("Purchase validation failed", error);
    throw new Error(error.message);
  }
});
