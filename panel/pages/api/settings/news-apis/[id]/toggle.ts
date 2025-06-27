import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  const { id } = req.query;

  // Check if user is global admin
  if (session?.user?.role !== 'global_admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const api = await prisma.newsAPI.findUnique({
      where: { id: String(id) }
    });

    if (!api) {
      return res.status(404).json({ error: 'API not found' });
    }

    const updatedAPI = await prisma.newsAPI.update({
      where: { id: String(id) },
      data: {
        isActive: !api.isActive
      }
    });

    res.status(200).json(updatedAPI);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle API status' });
  }
}
