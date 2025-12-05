import { db } from '../database';
import { analysisRecords, orders, traders, positionRecords } from '../database/schema';
import { eq, desc } from 'drizzle-orm';

export class DbService {

    // --- Analysis Records (Agent Logs/Thoughts) ---

    static async saveAnalysisRecord(data: typeof analysisRecords.$inferInsert) {
        try {
            const result = await db.insert(analysisRecords).values(data).returning();
            return result[0];
        } catch (error) {
            console.error('Failed to save analysis record:', error);
            return null;
        }
    }

    static async getAnalysisRecords(limit: number = 50) {
        try {
            return await db.select()
                .from(analysisRecords)
                .orderBy(desc(analysisRecords.createdAt))
                .limit(limit);
        } catch (error) {
            console.error('Failed to fetch analysis records:', error);
            return [];
        }
    }

    static async getAnalysisRecordsByTrader(traderId: string, limit: number = 50) {
        try {
            return await db.select()
                .from(analysisRecords)
                .where(eq(analysisRecords.traderId, traderId))
                .orderBy(desc(analysisRecords.createdAt))
                .limit(limit);
        } catch (error) {
            console.error('Failed to fetch analysis records for trader:', error);
            return [];
        }
    }

    // --- Traders ---

    static async ensureTrader(name: string, description: string = '') {
        try {
            // Check if exists
            const existing = await db.select().from(traders).where(eq(traders.name, name)).limit(1);
            if (existing.length > 0) {
                return existing[0];
            }
            // Create
            const result = await db.insert(traders).values({ name, description }).returning();
            return result[0];
        } catch (error) {
            console.error('Failed to ensure trader:', error);
            // Fallback to finding again if race condition
            const existing = await db.select().from(traders).where(eq(traders.name, name)).limit(1);
            return existing[0];
        }
    }


    // --- Orders ---

    static async saveOrder(data: typeof orders.$inferInsert) {
        try {
            const result = await db.insert(orders).values(data).returning();
            return result[0];
        } catch (error) {
            console.error('Failed to save order:', error);
            return null;
        }
    }

    static async getOrders(limit: number = 100) {
        try {
            return await db.select()
                .from(orders)
                .orderBy(desc(orders.createdAt))
                .limit(limit);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            return [];
        }
    }

    // --- Positions ---

    static async savePositionRecord(data: typeof positionRecords.$inferInsert) {
        try {
            const result = await db.insert(positionRecords).values(data).returning();
            return result[0];
        } catch (error) {
            console.error('Failed to save position record:', error);
            return null;
        }
    }
}
