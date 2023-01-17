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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _a;
exports.__esModule = true;
exports.Report = void 0;
require("dotenv").config();
// Load the AWS SDK for Node.js
var AWS = require("aws-sdk");
var faker = require("@faker-js/faker").faker;
// Set the region
AWS.config.update({
    credentials: {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_KEY
    },
    region: process.env.REGION
});
// Create DynamoDB service object
var ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
var Report = /** @class */ (function () {
    function Report() {
    }
    return Report;
}());
exports.Report = Report;
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
            max: 1673604076482 })
    };
}
var reportAmount = 1014;
var reports = [];
var params = {
    RequestItems: (_a = {},
        _a["".concat(process.env.TABLE_NAME)] = [
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
        _a)
};
for (var i = 0; i < reportAmount; i++) {
    reports.push(createRandomReport());
    params.RequestItems["".concat(process.env.TABLE_NAME)].push({
        PutRequest: {
            Item: {
                id: { S: reports[i]._id },
                userAgent: { S: reports[i].userAgent },
                category: { S: reports[i].category },
                countryId: { S: reports[i].countryId },
                clientId: { S: reports[i].clientId },
                subcategory: { S: reports[i].subcategory },
                creationDate: { S: reports[i].creationDate.toString() }
            }
        }
    });
}
// ddb.batchWriteItem(params, function (err, data) {
//   if (err) {
//     console.log("Error", err);
//   } else {
//     console.log("Success", data);
//   }
// });
function seedDataToDb() {
    return __awaiter(this, void 0, void 0, function () {
        var chunk, i, temp, err_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    chunk = 25;
                    i = 0;
                    _b.label = 1;
                case 1:
                    if (!(i < params.RequestItems["".concat(process.env.TABLE_NAME)].length)) return [3 /*break*/, 4];
                    temp = params.RequestItems["".concat(process.env.TABLE_NAME)].slice(i, i + chunk);
                    return [4 /*yield*/, ddb.batchWriteItem({ RequestItems: (_a = {}, _a["".concat(process.env.TABLE_NAME)] = temp, _a) }).promise()];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    i += chunk;
                    return [3 /*break*/, 1];
                case 4: return [3 /*break*/, 6];
                case 5:
                    err_1 = _b.sent();
                    console.log(err_1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
seedDataToDb();
