## Getting started
```
npm install
```

## Deploy infrastructure to AWS
```
sls deploy --verbose --stage <dev or stage or prod>
```

## Deploy function to AWS
In case you did not change configuration files such as package.json and serverless.yml you don't need to re-deploy your entire infrastructure again and waste a lot of time. You can re-deploy only the function you want and it will deploy it to AWS along with code changes in files imported by your function

```
sls deploy -f <functionName> --verbose
```

## Watch logs for scheduled lambdas in real-time
```
sls logs -f <lambda> -t
```

## Execute Lambda Function and see the logs
```
sls invoke -f <lambda> -l
```

## Global Secondary Index (GSI) statusAndEndDate
Global secondary indexes allow us to search for something besides the primary key (id in this case).
Since we want to be able to search for auctions that maintained the OPEN status for more than 1 hour.