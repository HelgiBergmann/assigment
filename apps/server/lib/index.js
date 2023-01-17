"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const prepareData_1 = require("./utils/prepareData");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
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
const ddb = new client_dynamodb_1.DynamoDBClient({
    credentials: {
        accessKeyId: process.env.ACCESS_KEY || '',
        secretAccessKey: process.env.SECRET_KEY || '',
    },
    region: process.env.REGION
});
//  ReplyError: ERR max number of clients reached
// exclude redis from clusters
let redisStoreReports = '';
// Set and get reports from redis
// Swittch from dynamo to redis because redis works faster
const setReportsToRedisDb = () => __awaiter(void 0, void 0, void 0, function* () {
    const getAllReports = yield ddb.send(new client_dynamodb_1.ScanCommand({ TableName: process.env.TABLE_NAME }));
    // Set data to redis
    yield redis.call("JSON.SET", "reports", "$", JSON.stringify(getAllReports));
    // redisStoreReports = await redis.call("JSON.GET", "reports");
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    // On applciation start, set reports to redis 
    // TODO: --> swtich from dynamo to redis
    // runs once on application start
    yield setReportsToRedisDb();
    const runKoa = (message) => __awaiter(void 0, void 0, void 0, function* () {
        const app = new Koa();
        const router = new Router();
        app.use(cors());
        app.use(bodyParser());
        app.use(addToContext({ ddb, redisStoreReports }));
        router
            .get("/barchart", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
            // s
            console.log('barchart request');
            // const { redisStoreReports } = ctx;
            // console.log(redisStoreReports, "redisStoreReports");
            const redisStoreReports = yield redis.call("JSON.GET", "reports");
            const reports = (0, prepareData_1.getDataForReport)(JSON.parse(redisStoreReports).Items);
            const charts = (0, prepareData_1.prepareDataForChart)(reports);
            const totalReports = reports.totalReports;
            ctx.body = JSON.stringify({ charts, totalReports });
        }))
            .get("/reports", middleware({
            allowAll: true,
            maximum: 20,
            unit: 'bytes'
        }), (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
            const { ExclusiveStartKey } = ctx.request.querystring;
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
            const data = yield ddb.send(new client_dynamodb_1.ScanCommand(params));
            ctx.body = JSON.stringify(data);
        }))
            .get("/report/:id", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
            const { ddb } = ctx;
            const params = {
                TableName: process.env.TABLE_NAME,
                Key: {
                    id: { S: ctx.params.id }
                }
            };
            const { Item } = yield ddb.send(new client_dynamodb_1.GetItemCommand(params));
            ctx.body = JSON.stringify(Item);
        }))
            .put("/report/:id", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
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
                const { Attributes } = yield ddb.send(new client_dynamodb_1.UpdateItemCommand(params));
                console.log("Success - item added or updated", Attributes);
                ctx.body = JSON.stringify(Attributes);
            }
            catch (err) {
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
        }));
        app.use(router.routes()).use(router.allowedMethods());
        app.listen(PORT, function () {
            console.log(`${message}`);
        });
    });
    if (clusterWorkerSize > 1) {
        if (cluster.isPrimary) {
            for (let i = 0; i < clusterWorkerSize; i++) {
                cluster.fork();
            }
            cluster.on("exit", function (worker) {
                console.log("Worker", worker.id, " has exitted.");
            });
        }
        else {
            runKoa(`Koa server listening on port ${PORT} and worker ${process.pid}`);
        }
    }
    else {
        runKoa(`Koa server listening on port ${PORT} with the single worker ${process.pid}`);
    }
}))();
