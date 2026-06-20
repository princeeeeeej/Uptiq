import "dotenv/config";
import { PrismaClient } from "./generated/prisma/client"

export const prismaclient = new PrismaClient();
