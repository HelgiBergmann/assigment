import { NextApiRequest, NextApiResponse } from "next";
import { faker } from '@faker-js/faker';
import NextCors from 'nextjs-cors';
import { getDataForReport, prepareDataForChart } from "./utils/prepareData";

export class Report {
  userAgent!: string;
  _id!: string;
  category!: string;
  countryId!: string;
  clientId!: string;
  subcategory!: string;
  creationDate!: Date;
}




function createRandomReport(): Report {
  return {
    userAgent: faker.internet.userAgent(),
    _id: faker.datatype.uuid(),
    clientId:  faker.helpers.arrayElement([
      '111a7358-7c24-4a81-af09-cfade6b3d30c',
      '0707ad8b-7756-426a-85c6-bcb9c62a83c6',
      'ac689e5d-0744-4264-8eae-d44a3f19cb66',
      '4ad4a7d3-f7d2-477c-a98e-701725284487',
      '2003399e-635e-4c16-a527-04cc43fb1284',
      '97b3b393-352a-4b19-b710-d92d70897256',
      'da4e8dee-91c8-47ba-924b-ea81ff4b1405',
      '4709ae8d-d635-482d-a67f-abaf92996b97',
      ]
    ),    
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
    category: 'category ' + faker.datatype.number({max:91}),
    subcategory: 'subcategory ' + faker.datatype.number({max:91}),
    creationDate: faker.datatype.datetime({min: 1673009112868
      , max: 1673604076482}),
  };
}




export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const reportAmount = 1014;
  const reports: Report[] = [];

 

  for (let i = 0; i < reportAmount; i++) {
    reports.push(createRandomReport());
  }

  const data = getDataForReport(reports);
  const totalReports = data.totalReports;
  const result = prepareDataForChart(data);

  

  // console.log(barChart);

  await NextCors(req, res, {
    // Options
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
 });
  
  res.status(200).json({charts: result, totalReports})
}