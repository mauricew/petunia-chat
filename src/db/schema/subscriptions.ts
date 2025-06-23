import { decimal, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./auth";

export const subscriptionPlanEnum = pgEnum('subscription_plan', [
  'free',
  'basic',
  'premium',
]);

export const subscriptionsTable = pgTable('subscriptions', {
  id: uuid().primaryKey(),
  userId: text().notNull().references(() => users.id),
  plan: subscriptionPlanEnum().notNull(),
  amount: decimal(),
  currency: text(),
  effectiveAt: timestamp().notNull(),
  expiresAt: timestamp(),
  canceledAt: timestamp(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow().$onUpdate(() => new Date()),
})

export const subscriptionPaymentsTable = pgTable('subscription_payments', {
  id: uuid().primaryKey(),
  subscriptionId: uuid().notNull().references(() => subscriptionsTable.id),
  amount: decimal().notNull(),
  currency: text().notNull(),
  paidAt: timestamp(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow().$onUpdate(() => new Date()),
})