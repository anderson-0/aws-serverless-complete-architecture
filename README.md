# Codingly.io: Base Serverless Framework Template

## What's included
* Folder structure used consistently across our projects.
* [serverless-pseudo-parameters plugin](https://www.npmjs.com/package/serverless-pseudo-parameters): Allows you to take advantage of CloudFormation Pseudo Parameters.
* [serverless-bundle plugin](https://www.npmjs.com/package/serverless-pseudo-parameters): Bundler based on the serverless-webpack plugin - requires zero configuration and fully compatible with ES6/ES7 features.

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