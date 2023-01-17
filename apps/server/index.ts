import { getDataForReport, prepareDataForChart } from "./utils/prepareData";
import { redis } from "./redis";

import { DynamoDBClient, ScanCommand, UpdateItemCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";


require("dotenv").config();

const Koa = require("koa");
const { middleware } = require('koa-pagination');
const os = require("os");
const cluster = require("cluster");
const Router = require("@koa/router");
const addToContext = require("koa-add-to-context");
const bodyParser = require('koa-body-parser');


const cors = require('@koa/cors');


const AWS = require("aws-sdk");
const Redis = require('ioredis');


// Connect redis but still do not know what the purpose becouse DynamoDB has DAX alternative for caching
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});



// AWS.config.update({
//   credentials: {
//     accessKeyId: process.env.ACCESS_KEY,
//     secretAccessKey: process.env.SECRET_KEY,
//   },
//   region: process.env.REGION,
// });

const PORT = process.env.PORT || 5000;

const clusterWorkerSize = os.cpus().length;



const ddb = new DynamoDBClient({
  credentials: {
    accessKeyId: process.env.ACCESS_KEY || '',
    secretAccessKey: process.env.SECRET_KEY || '',
  }, 
  region: process.env.REGION 
});

//  ReplyError: ERR max number of clients reached
// exclude redis from clusters
let redisStoreReports: string = '';


// Set and get reports from redis
// Swittch from dynamo to redis because redis works faster
const setReportsToRedisDb = async () => {
  const getAllReports = await ddb.send(new ScanCommand({ TableName: process.env.TABLE_NAME}));

  // Set data to redis
  await redis.call("JSON.SET", "reports", "$", JSON.stringify(getAllReports));
  // redisStoreReports = await redis.call("JSON.GET", "reports");
}


(async () => {

  // On applciation start, set reports to redis 
  // TODO: --> swtich from dynamo to redis
  // runs once on application start
  await setReportsToRedisDb();

  const runKoa = async (message: string) => {
    const app = new Koa();
    const router = new Router();
    app.use(cors());
    app.use(bodyParser());
    app.use(
      addToContext({ ddb, redisStoreReports })
    );

    router
      .get("/barchart", async (ctx, next) => {
        // s
        console.log('barchart request')
        // const { redisStoreReports } = ctx;
        // console.log(redisStoreReports, "redisStoreReports");
        const redisStoreReports = await redis.call("JSON.GET", "reports");
        const reports = getDataForReport(JSON.parse(redisStoreReports).Items);
        const charts = prepareDataForChart(reports);
        const totalReports = reports.totalReports;
        
        ctx.body = JSON.stringify({charts, totalReports});
      })
      .get("/reports", middleware({
        allowAll: true,
        maximum: 20,
        unit: 'bytes'
      })
      , async (ctx, next) => {
       
        const {ExclusiveStartKey} = ctx.request.querystring;
        const { ddb } = ctx;
        const params = {
          // Specify which items in the results are returned.
          // FilterExpression: "Subtitle = :topic AND Season = :s AND Episode = :e",
          // // Define the expression attribute value, which are substitutes for the values you want to compare.
          // ExpressionAttributeValues: {
          //   ":topic": {S: "SubTitle2"},
          //   ":s": {N: 1},
          //   ":e": {N: 2},
          // },
          // // Set the projection expression, which are the attributes that you want.
          // ProjectionExpression: "Season, Episode, Title, Subtitle",
          ExclusiveStartKey: ExclusiveStartKey ? JSON.parse(ExclusiveStartKey) : null,
          TableName: process.env.TABLE_NAME,
          Limit: ctx.pagination.limit,
        };
        const data = await ddb.send(new ScanCommand(params));
        ctx.body = JSON.stringify(data);
      })
      .get("/report/:id", async (ctx, next) => {
        const { ddb } = ctx;
        const params = {
          TableName: process.env.TABLE_NAME,
          Key: {
            id: { S: ctx.params.id }
          }
        };
        const {Item} = await ddb.send(new GetItemCommand(params));
        ctx.body = JSON.stringify(Item);
      })
      .put("/report/:id", async (ctx, next) => {
        const report = JSON.parse(ctx.request.body.data);
        console.log(report.category.S, "report");
        const params = {
          TableName: process.env.TABLE_NAME,
            Key: {
            id: { S: ctx.params.id }
          },
          ExpressionAttributeValues: {
            // ':c': { S: ctx.request.body.content },
            ':c': { S: report.category.S },
          },
          UpdateExpression: 'set category = :c',
          ReturnValues: 'ALL_NEW'
        };

        try {
          const {Attributes} = await ddb.send(new UpdateItemCommand(params));
          console.log("Success - item added or updated", Attributes);
          ctx.body = JSON.stringify(Attributes);
        } catch (err) {
          console.log("Error", err);
        }
        // const { Attributes } = ddb.send(
        //   new UpdateItemCommand({
        //     TableName: process.env.TABLE_NAME,
        //     Key: {
        //       id: { S: ctx.params.id }
        //     },
        //     UpdateExpression: ['set content = :c', 'set category = : cat'],
        //     ExpressionAttributeValues: {
        //       ':c': { S: ctx.request.body.content },
        //       ':cat': { S: ctx.request.body.category },
        //     },
        //     ReturnValues: 'ALL_NEW'
        //   })
        // );
        
      }

    )

    app.use(router.routes()).use(router.allowedMethods());

    app.listen(PORT, function () {
      console.log(`${message}`);
    });
  };

  if (clusterWorkerSize > 1) {
    if (cluster.isPrimary) {
      for (let i = 0; i < clusterWorkerSize; i++) {
        cluster.fork();
      }

      cluster.on("exit", function (worker) {
        console.log("Worker", worker.id, " has exitted.");
      });
    } else {
      runKoa(`Koa server listening on port ${PORT} and worker ${process.pid}`);
    }
  } else {
    runKoa(
      `Koa server listening on port ${PORT} with the single worker ${process.pid}`
    );
  }
})()
