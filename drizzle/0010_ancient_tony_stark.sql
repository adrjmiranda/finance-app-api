DROP VIEW "public"."transactions_balance_view";--> statement-breakpoint
CREATE VIEW "public"."transactions_balance_view" AS (
    SELECT 
      "transactions"."user_id" as user_id,
      SUM(CASE WHEN "transactions"."type" = 'earning' THEN "transactions"."amount" ELSE 0 END) as earnings,
      SUM(CASE WHEN "transactions"."type" = 'expense' THEN "transactions"."amount" ELSE 0 END) as expenses,
      SUM(CASE WHEN "transactions"."type" = 'investment' THEN "transactions"."amount" ELSE 0 END) as investments,
      SUM(CASE WHEN "transactions"."type" = 'expense' THEN -"transactions"."amount" ELSE "transactions"."amount" END) as balance
    FROM "transactions"
    GROUP BY "transactions"."user_id"
  );