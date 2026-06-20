# Automated Expense Tracker — Tutorials

Welcome to the Automated Expense Tracker! This document contains quick tutorials on how to interact with the core features of the system.

## 1. How to Manually Add a Transaction
While the app automatically parses your bank SMS messages, you can always add cash transactions manually.
1. Open the **Mobile App**.
2. Tap the floating **`+` (Plus)** icon on the bottom right of the Home or Transactions screen.
3. Enter the **Amount**, **Merchant Name**, and select a **Category** (e.g., Food, Transport).
4. Tap **Save**. The transaction is immediately saved to your local SQLite database and will silently sync to Firebase in the background.

## 2. How to Review Pending Transactions
Sometimes, the SMS Parsing Engine isn't 100% sure about an SMS (confidence score < 90%). 
1. Navigate to the **Review Queue** from the Home Dashboard or the Settings menu.
2. You will see a list of flagged transactions marked with a yellow warning icon.
3. Tap **Edit** to fix the extracted amount or merchant, or simply tap **Approve** if the details are correct.
4. Once approved, it will be permanently added to your budget calculations.

## 3. How to Create a Split Expense
Went out to dinner with friends? Here is how you split the bill:
1. Go to the **Split Expenses** tab.
2. Tap **+ New Split**.
3. Enter the total bill amount and what the bill was for (e.g., "Dinner at Rajdhani").
4. Enter the names of your friends.
5. Select **Equally** (splits evenly) or **Exact Amounts**.
6. Tap **Create Split**. You can now track who owes you money on your dashboard!

## 4. How to Update SMS Parser Regex Rules Dynamically
If a bank changes its SMS format, you don't need to push a new version of the app to the Play Store/App Store.
1. Go to the **Firebase Console**.
2. Navigate to **Run > Remote Config**.
3. Find the `bank_patterns` parameter.
4. Update the JSON array with your new Regex pattern:
   ```json
   { "bank": "HDFC", "type": "debit", "pattern": "new regex here" }
   ```
5. Click **Publish**. 
6. When users next open the app, it will silently fetch the new rules and start parsing SMS messages correctly.

## 5. How to View the Admin Dashboard
The Next.js Admin dashboard provides a birds-eye view of your users.
1. Run the web project locally (`npm run web dev`) or go to your Vercel URL.
2. The homepage shows your Daily Active Users (DAU) and system health.
3. Navigate to **Users** to view a table of registered accounts.
4. Navigate to **System Health** to see if your Cloud Functions and Firebase DB are running nominally.
