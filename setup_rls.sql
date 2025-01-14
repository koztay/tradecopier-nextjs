-- Enable RLS on all tables
ALTER TABLE "public"."_prisma_migrations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Trade" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Leader" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Follower" ENABLE ROW LEVEL SECURITY;

-- User table policies
CREATE POLICY "Users can view their own data" ON "public"."User"
    FOR SELECT USING (auth.uid()::text = id);
    
CREATE POLICY "Users can update their own data" ON "public"."User"
    FOR UPDATE USING (auth.uid()::text = id);

-- Subscription policies
CREATE POLICY "Users can view their own subscriptions" ON "public"."Subscription"
    FOR SELECT USING (auth.uid()::text = "userId");
    
CREATE POLICY "Users can manage their own subscriptions" ON "public"."Subscription"
    FOR ALL USING (auth.uid()::text = "userId");

-- Leader policies
CREATE POLICY "Users can view their own leaders" ON "public"."Leader"
    FOR SELECT USING (auth.uid()::text = "userId");
    
CREATE POLICY "Users can manage their own leaders" ON "public"."Leader"
    FOR ALL USING (auth.uid()::text = "userId");

-- Follower policies
CREATE POLICY "Users can view their own followers" ON "public"."Follower"
    FOR SELECT USING (auth.uid()::text = "userId");
    
CREATE POLICY "Users can manage their own followers" ON "public"."Follower"
    FOR ALL USING (auth.uid()::text = "userId");

-- Trade policies
CREATE POLICY "Users can view related trades" ON "public"."Trade"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "public"."Leader" 
            WHERE "Leader".id = "Trade"."leaderId" 
            AND "Leader"."userId" = auth.uid()::text
        )
        OR 
        EXISTS (
            SELECT 1 FROM "public"."Follower" 
            WHERE "Follower"."leaderId" = "Trade"."leaderId" 
            AND "Follower"."userId" = auth.uid()::text
        )
    );

-- Allow public access to _prisma_migrations for Prisma to work
CREATE POLICY "Allow public access to _prisma_migrations" ON "public"."_prisma_migrations"
    FOR ALL USING (true); 