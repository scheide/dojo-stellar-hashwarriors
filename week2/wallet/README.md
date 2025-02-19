# Stellar Wallet

Project created to accomplish Nearx DOJO Stellar Week 2 challenge. This app implements features to create accounts, send XLM tokens between two accounts, and show account balances.

## :hammer_and_wrench: Installation

1. Install dependencies:
   ```bash
   npm install
   ```

## :rocket: Usage
1. Configure `.env` file with PostgreSQL credentials:
    ```env
    DATABASE_URL="postgresql://username:password@localhost:5432/mydatabase"
    ```

2. Run Prisma migration:
    ```bash
    npx prisma migrate dev --name init
    ```

3. Run the development server:
    ```bash
    npm run dev
    ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## :movie_camera: Preview
Creating an account:

![Create account](public/01-create-account.png)
![Account created](public/02-account-created.png)

Listing accounts:

![List accounts](public/03-list-accounts.png)

Sending XLM:

![Transaction](public/04-transaction.png)
![Transaction success](public/05-transaction-success.png)

Checking balances after transaction:

![Checking balances](public/06-check-balances.png)