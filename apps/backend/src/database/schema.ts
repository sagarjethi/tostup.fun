import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// --- USERS TABLE ---
export const users = sqliteTable("users", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    role: text("role", { enum: ["admin", "user"] })
        .notNull()
        .default("user"),
    createdAt: text("created_at")
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);


// --- TRADERS TABLE ---
export const traders = sqliteTable("traders", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull().unique(),
    description: text("description"),
    createdAt: text("created_at")
        .notNull()
        .$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updated_at")
        .notNull()
        .$defaultFn(() => new Date().toISOString()),
});

export const insertTraderSchema = createInsertSchema(traders);
export const selectTraderSchema = createSelectSchema(traders);


// --- ANALYSIS RECORDS (Chat Logs) ---
export const analysisRecords = sqliteTable(
    "analysis_records",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => crypto.randomUUID()),
        traderId: text("trader_id")
            .notNull()
            .references(() => traders.id, { onDelete: "restrict" }),
        role: text("role").notNull(), // 'Risk Manager', 'Portfolio Manager'
        chat: text("chat").notNull(), // The text content
        jsonValue: text("json_value"), // Structured data
        recordId: text("record_id"), // Grouping ID for a single run
        orderId: text("order_id"),
        createdAt: text("created_at")
            .notNull()
            .$defaultFn(() => new Date().toISOString()),
        updatedAt: text("updated_at")
            .notNull()
            .$defaultFn(() => new Date().toISOString()),
    },
    (table: any) => ({
        traderTimeIdx: index("idx_analysis_records_trader_created").on(
            table.traderId,
            table.createdAt
        ),
        roleIdx: index("idx_analysis_records_role").on(table.role),
    })
);

export const insertAnalysisRecordSchema = createInsertSchema(analysisRecords);
export const selectAnalysisRecordSchema = createSelectSchema(analysisRecords);


// --- POSITION RECORDS ---
export const positionRecords = sqliteTable(
    "position_records",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => crypto.randomUUID()),
        traderId: text("trader_id")
            .notNull()
            .references(() => traders.id, { onDelete: "restrict" }),
        recordId: text("record_id"),
        positions: text("positions").notNull(), // JSON
        accountBalance: real("account_balance").notNull(),
        createdAt: text("created_at")
            .notNull()
            .$defaultFn(() => new Date().toISOString()),
        updatedAt: text("updated_at")
            .notNull()
            .$defaultFn(() => new Date().toISOString()),
    },
    (table: any) => ({
        traderTimeIdx: index("idx_position_records_trader_created").on(
            table.traderId,
            table.createdAt
        ),
    })
);

export const insertPositionRecordSchema = createInsertSchema(positionRecords);
export const selectPositionRecordSchema = createSelectSchema(positionRecords);


// --- ORDERS TABLE ---
export const orders = sqliteTable("orders", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    traderId: text("trader_id")
        .notNull()
        .references(() => traders.id, { onDelete: "cascade" }),
    orderId: text("order_id").notNull(),
    clientOrderId: text("client_order_id"),
    symbol: text("symbol").notNull(),
    side: text("side", { enum: ["BUY", "SELL"] }).notNull(),
    type: text("type", {
        enum: ["LIMIT", "MARKET", "STOP", "STOP_MARKET", "TAKE_PROFIT", "TAKE_PROFIT_MARKET", "TRAILING_STOP_MARKET"]
    }).notNull(),
    positionSide: text("position_side", { enum: ["BOTH", "LONG", "SHORT"] }).notNull().default("BOTH"),
    status: text("status", {
        enum: ["NEW", "PARTIALLY_FILLED", "FILLED", "CANCELED", "REJECTED", "EXPIRED"]
    }).notNull(),
    timeInForce: text("time_in_force", {
        enum: ["GTC", "IOC", "FOK", "GTX", "HIDDEN"]
    }),
    price: text("price").notNull().default("0"),
    avgPrice: text("avg_price").default("0"),
    stopPrice: text("stop_price"),
    activatePrice: text("activate_price"),
    priceRate: text("price_rate"),
    origQty: text("orig_qty").notNull(),
    executedQty: text("executed_qty").default("0"),
    cumQuote: text("cum_quote").default("0"),
    reduceOnly: integer("reduce_only", { mode: "boolean" }).default(false),
    closePosition: integer("close_position", { mode: "boolean" }).default(false),
    priceProtect: integer("price_protect", { mode: "boolean" }).default(false),
    workingType: text("working_type", { enum: ["MARK_PRICE", "CONTRACT_PRICE"] }),
    origType: text("orig_type"),
    time: integer("time"),
    updateTime: integer("update_time"),
    createdAt: text("created_at")
        .notNull()
        .$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updated_at")
        .notNull()
        .$defaultFn(() => new Date().toISOString()),
});

export const insertOrderSchema = createInsertSchema(orders);
export const selectOrderSchema = createSelectSchema(orders);
