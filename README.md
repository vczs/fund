# fund contract

```shell
npm init -y
npm install -D hardhat
npx hardhat init
```

```shell
npm install -D @chainlink/contracts
npm install -D @chainlink/env-enc
npm install -D hardhat-deploy
```

```shell
npx env-enc set-pw
npx env-enc set
```

```shell
npx hardhat clean
npx hardhat compile
```

```shell
npx hardhat node
npx hardhat run ./scripts/depolyFunMe.js --network localhost
npx hardhat deploy --tags all --network localhost --reset
npx hardhat {task-name} --network localhost

# localhost 挖矿
npx hardhat console --network localhost
await network.provider.send("evm_mine")
```% 