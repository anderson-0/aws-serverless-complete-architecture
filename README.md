## Getting started
```
sls create --name YOUR_PROJECT_NAME --template-url https://github.com/codingly-io/sls-base
cd YOUR_PROJECT_NAME
npm install
```

You are ready to go!


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