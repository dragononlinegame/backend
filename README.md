## Description

Nest Backend For Color Prediction Game

- Apps
  |
  |- prediction-backend (main)
  |- queue-workers (queue workers for processing bets, winnings, commissions)

## Installation

```bash
$ npm install
```

## Running the app on development

```bash
# watch mode
# terminal 1
$ npx nest start prediction-backend --watch
# terminal 1
$ npx nest start queue-workers --watch
```

## Running the app on production

```bash
# build
$ npx nest build prediction-backend
$ npx nest build queue-workers

# run using node
# terminal 1
$ npx nest start prediction-backend
# terminal 2
$ npx nest start queue-workers


# run using pm2
$ pm2 start dist/apps/prediction-backend/main
$ pm2 start dist/apps/queue-workers/main
```

`

## API Reference

```
  - BASE_URL: https://<DOMAIN>/v1/api/

  [Auth]
  - POST /auth/signin
  - POST /auth/register

  [Users]
  { Protected }
  - GET /users/profile
  - GET /users
  - GET /users/:id
  - PATCH /users/:id
  - DELETE /users/:id

  [Wallet]
  { Protected }
  - GET /wallet
  - GET /wallet/transactions
  - GET /wallet/recharge

  [Games]
  - GET /games
  - GET /games/current
  {Protected}
  - GET /games/:id
  - GET /games/:id/wins
  - GET /games/wins
  - PATCH /games/:id
  - DELETE /games/:id

  [Bets]
  { Protected }
  - POST /bets
  - GET /bets [if user only return bets of themselves else for admin return all]
  - GET /bets/:id

  [Analytics]
  { Protected :: ADMIN_ONLY }
  - GET /analytics/activity
  - GET /analytics/users
  - GET /analytics/earnings
```
