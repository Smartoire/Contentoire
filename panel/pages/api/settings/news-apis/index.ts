import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  
  // Check if user is global admin
  if (session?.user?.role !== 'global_admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const newsAPIs = await prisma.newsAPI.findMany();
        res.status(200).json(newsAPIs);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch news APIs' });
      }
      break;

    case 'POST':
      try {
        const { name, apiKey, sources } = req.body;
        const newAPI = await prisma.newsAPI.create({
          data: {
            name,
            apiKey,
            sources: sources.join(','),
            isActive: true
          }
        });
        res.status(201).json(newAPI);
      } catch (error) {
        res.status(500).json({ error: 'Failed to create news API' });
      }
      break;

    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}
