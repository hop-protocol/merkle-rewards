# Merkle Rewards
A simple contract for distributing ongoing rewards calculated offchain.

## Usage
Rewards are periodically calculated offchain and a new Merkle tree containing the `totalAmount`s for each account is produced. The calculated `totalAmount`s amount for each account should strictly increase with time.

Each period, the owner calls `setMerkleRoot` and the new `merkleRoot` and `totalRewards` are set. This function also collects the difference between `previousTotalRewards` and the new `totalRewards` from the owner.

Accounts can withdraw the difference between their `totalAmount` and `merkleRewards.withdrawn(account)`.

## Compile
```
npm run compile
```

## Test
```
npm run test
```

## Getting Started
Create a `.env` file based on `.env-sample`

## Deploy Local
Start local node
```
npm run chain
```

Deploy to local node
```
npm run deploy:local
```

## Deploy
Deploy to Goerli
```
npm run goerli
```

Deploy to Mainnet
```
npm run goerli
```
# Lint

eslint
```shell
npm run eslint
```

prettier
```shell
npm run prettier
```

solhint
```shell
npm run solhint
```
