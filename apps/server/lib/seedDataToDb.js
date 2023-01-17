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
exports.ReportDynamo = exports.Report = void 0;
require("dotenv").config();
// Load the AWS SDK for Node.js
const AWS = require("aws-sdk");
const { faker } = require("@faker-js/faker");
// Set the region
AWS.config.update({
    credentials: {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_KEY,
    },
    region: process.env.REGION,
});
// Create DynamoDB service object
var ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
class Report {
}
exports.Report = Report;
class ReportDynamo {
}
exports.ReportDynamo = ReportDynamo;
function createRandomReport() {
    return {
        userAgent: faker.internet.userAgent(),
        _id: faker.datatype.uuid(),
        clientId: faker.helpers.arrayElement([
            '111a7358-7c24-4a81-af09-cfade6b3d30c',
            '0707ad8b-7756-426a-85c6-bcb9c62a83c6',
            'ac689e5d-0744-4264-8eae-d44a3f19cb66',
            '4ad4a7d3-f7d2-477c-a98e-701725284487',
            '2003399e-635e-4c16-a527-04cc43fb1284',
            '97b3b393-352a-4b19-b710-d92d70897256',
            'da4e8dee-91c8-47ba-924b-ea81ff4b1405',
            '4709ae8d-d635-482d-a67f-abaf92996b97',
        ]),
        countryId: faker.helpers.arrayElement([
            'TN',
            'KR',
            'GP',
            'GH',
            'TW',
            'NI',
            'SS',
            'PN',
        ]),
        category: 'category ' + faker.datatype.number({ max: 91 }),
        subcategory: 'subcategory ' + faker.datatype.number({ max: 91 }),
        creationDate: faker.datatype.datetime({ min: 1673009112868,
            max: 1673604076482 }),
    };
}
const reportAmount = 1014;
const reports = [];
const params = {
    RequestItems: {
        [`${process.env.TABLE_NAME}`]: [
        // {
        //   PutRequest: {
        //     Item: {
        //       KEY: { N: "KEY_VALUE" },
        //       ATTRIBUTE_1: { S: "ATTRIBUTE_1_VALUE" },
        //       ATTRIBUTE_2: { N: "ATTRIBUTE_2_VALUE" },
        //     },
        //   },
        // },
        // {
        //   PutRequest: {
        //     Item: {
        //       KEY: { N: "KEY_VALUE" },
        //       ATTRIBUTE_1: { S: "ATTRIBUTE_1_VALUE" },
        //       ATTRIBUTE_2: { N: "ATTRIBUTE_2_VALUE" },
        //     },
        //   },
        // },
        ],
    },
};
for (let i = 0; i < reportAmount; i++) {
    reports.push(createRandomReport());
    params.RequestItems[`${process.env.TABLE_NAME}`].push({
        PutRequest: {
            Item: {
                id: { S: reports[i]._id },
                userAgent: { S: reports[i].userAgent },
                category: { S: reports[i].category },
                countryId: { S: reports[i].countryId },
                clientId: { S: reports[i].clientId },
                subcategory: { S: reports[i].subcategory },
                creationDate: { S: reports[i].creationDate.toString() },
            }
        }
    });
}
function seedDataToDb() {
    return __awaiter(this, void 0, void 0, function* () {
        // batchWriteItem has max abilities to write 25 items at once so we need to chunk the data
        try {
            const chunk = 25;
            for (let i = 0; i < params.RequestItems[`${process.env.TABLE_NAME}`].length; i += chunk) {
                const temp = params.RequestItems[`${process.env.TABLE_NAME}`].slice(i, i + chunk);
                yield ddb.batchWriteItem({ RequestItems: { [`${process.env.TABLE_NAME}`]: temp } }).promise();
            }
        }
        catch (err) {
            console.log(err);
        }
    });
}
seedDataToDb();
