import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';

import { prismaclient } from 'store/client';
import { AuthInput } from './types';
import { authMiddleware } from './middleware';

const app = express();

app.use(cors());
app.use(express.json());

app.post('/user/signup', async (req, res) => {
  const data = AuthInput.safeParse(req.body);

  if (!data.success) {
    return res.status(400).json({
      message: 'Invalid input',
    });
  }

  try {
    const existingUser = await prismaclient.user.findUnique({
      where: {
        username: data.data.username,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'Username already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(data.data.password, 10);

    const user = await prismaclient.user.create({
      data: {
        username: data.data.username,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      id: user.id,
    });
  } catch (error) {
    res.status(500).json({
      error: String(error),
    });
  }
});

app.post('/user/signin', async (req, res) => {
  const data = AuthInput.safeParse(req.body);

  if (!data.success) {
    return res.status(400).json({
      message: 'Invalid input',
    });
  }

  try {
    const user = await prismaclient.user.findUnique({
      where: {
        username: data.data.username,
      },
    });

    if (!user) {
      return res.status(403).json({
        message: 'Invalid credentials',
      });
    }

    const isValid = await bcrypt.compare(data.data.password, user.password);

    if (!isValid) {
      return res.status(403).json({
        message: 'Invalid credentials',
      });
    }

    const token = jwt.sign(
      {
        sub: user.id,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: '7d',
      },
    );

    res.json({
      jwt: token,
    });
  } catch (error) {
    res.status(500).json({
      error: String(error),
    });
  }
});

app.get('/user/me', authMiddleware, async (req, res) => {
  try {
    const user = await prismaclient.user.findUnique({
      where: {
        id: req.userId,
      },
      select: {
        id: true,
        username: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/website', authMiddleware, async (req, res) => {
  const { name, url, slug } = req.body;

  if (!name || !url || !slug) {
    return res.status(400).json({
      message: 'name, url and slug are required',
    });
  }

  try {
    const website = await prismaclient.website.create({
      data: {
        name,
        url,
        slug,
        userId: req.userId!,
      },
    });

    res.status(201).json({
      id: website.id,
    });
  } catch (error) {
    res.status(500).json({
      error: String(error),
    });
  }
});

app.get('/websites', authMiddleware, async (req, res) => {
  try {
    const websites = await prismaclient.website.findMany({
      where: {
        userId: req.userId!,
      },
      include: {
        status: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      websites,
    });
  } catch (error) {
    res.status(500).json({
      error: String(error),
    });
  }
});

app.get('/website/:websiteId', authMiddleware, async (req, res) => {
  const websiteId = req.params.websiteId as string;
  try {
    const website = await prismaclient.website.findFirst({
      where: {
        id: websiteId,
        userId: req.userId!,
      },
      include: {
        status: true,
        sslStatus: true,
      },
    });

    if (!website) {
      return res.status(404).json({
        message: 'Website not found',
      });
    }

    res.json({
      id: website.id,
      name: website.name,
      url: website.url,
      slug: website.slug,

      currentStatus: website.status?.currentStatus ?? 'UNKNOWN',

      responseTime: website.status?.lastResponseTimeMs ?? null,

      consecutiveFails: website.status?.consecutiveFails ?? 0,

      lastCheckedAt: website.status?.lastCheckedAt ?? null,

      ssl: website.sslStatus,
    });
  } catch (error) {
    res.status(500).json({
      error: String(error),
    });
  }
});

app.get('/website/:websiteId/ticks', authMiddleware, async (req, res) => {
  const websiteId = req.params.websiteId as string;
  try {
    const website = await prismaclient.website.findFirst({
      where: {
        id: websiteId,
        userId: req.userId!,
      },
    });

    if (!website) {
      return res.status(404).json({
        message: 'Website not found',
      });
    }

    const ticks = await prismaclient.websiteTick.findMany({
      where: { websiteId },
      orderBy: { checkedAt: 'desc' },
      take: 50,
    });

    res.json({
      ticks: ticks.reverse(),
    });
  } catch (error) {
    res.status(500).json({
      error: String(error),
    });
  }
});

app.get('/website/:websiteId/incidents', authMiddleware, async (req, res) => {
  const websiteId = req.params.websiteId as string;
  try {
    const website = await prismaclient.website.findFirst({
      where: {
        id: websiteId,
        userId: req.userId!,
      },
    });

    if (!website) {
      return res.status(404).json({
        message: 'Website not found',
      });
    }

    const incidents = await prismaclient.incident.findMany({
      where: { websiteId },
      orderBy: { startedAt: 'desc' },
      take: 20,
    });

    res.json({
      incidents,
    });
  } catch (error) {
    res.status(500).json({
      error: String(error),
    });
  }
});

app.delete('/website/:websiteId', authMiddleware, async (req, res) => {
  const websiteId = req.params.websiteId as string;

  try {
    const website = await prismaclient.website.findFirst({
      where: {
        id: websiteId,
        userId: req.userId!,
      },
    });

    if (!website) {
      return res.status(404).json({
        message: 'Website not found',
      });
    }

    await prismaclient.website.delete({
      where: {
        id: website.id,
      },
    });

    res.json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      error: String(error),
    });
  }
});

app.listen(8080, () => {
  console.log('API running on port 8080');
});
