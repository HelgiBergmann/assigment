import { NextApiRequest, NextApiResponse } from "next";
import { faker } from '@faker-js/faker';


class Report {
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
    clientId: faker.datatype.uuid(),
    countryId: faker.address.countryCode(),
    category: 'category ' + faker.datatype.number({max:91}),
    subcategory: 'subcategory ' + faker.datatype.number({max:91}),
    creationDate: faker.datatype.datetime({min: 1673603107239, max: 1673604076482}),
  };
}


export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const reportAmount = 1014;
  const reports: Report[] = [];

  for (let i = 0; i < reportAmount; i++) {
    reports.push(createRandomReport());
  }

  const result = {
    reports,
    total: reportAmount,
  }
  
  res.status(200).json(result)
}