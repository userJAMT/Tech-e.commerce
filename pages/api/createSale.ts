import { prisma } from "lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handlerCreateSale(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { total, date, userId, state } = req.body;
  //!in order create the sale, you must pass by date an constant with new Date()
  //! and then pass that constant like date.toISOString()
  //? just like this => new Date().toISOString()
  console.log(total, date, userId, state)
  try {
    const creation = await prisma.sale.create({
      data: {
        total: total,
        date: date,
        userId: userId,
        state: state
      },
    });
    return res.status(200).json(creation);
  }  catch (error) {
    if(error instanceof Error){
    return res.status(400).json({ message: error.message });
    }
    else return res.status(404).json({message: "error not found"})
  }
}
