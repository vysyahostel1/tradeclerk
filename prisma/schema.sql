-- TradeClerk Database Schema for Cloudflare D1
-- Run this after creating your D1 database:
--   npx wrangler d1 execute tradeclerk-db --file=./prisma/schema.sql
--
-- Or use the Prisma push with libsql adapter.

-- Users table
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "password" TEXT,
  "image" TEXT,
  "role" TEXT NOT NULL DEFAULT 'USER',
  "bio" TEXT,
  "expertise" TEXT,
  "company" TEXT,
  "phone" TEXT,
  "isVerified" BOOLEAN NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT 1,
  "karma" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- Categories table
CREATE TABLE IF NOT EXISTS "Category" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "icon" TEXT,
  "color" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "Category_name_key" ON "Category"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "Category_slug_key" ON "Category"("slug");

-- Tags table
CREATE TABLE IF NOT EXISTS "Tag" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "Tag_name_key" ON "Tag"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "Tag_slug_key" ON "Tag"("slug");

-- Reports table
CREATE TABLE IF NOT EXISTS "Report" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "summary" TEXT,
  "content" TEXT,
  "coverImage" TEXT,
  "pdfUrl" TEXT,
  "analystId" TEXT,
  "categoryId" TEXT NOT NULL,
  "isPremium" BOOLEAN NOT NULL DEFAULT 0,
  "isPublished" BOOLEAN NOT NULL DEFAULT 0,
  "isFeatured" BOOLEAN NOT NULL DEFAULT 0,
  "viewCount" INTEGER NOT NULL DEFAULT 0,
  "downloadCount" INTEGER NOT NULL DEFAULT 0,
  "pageCount" INTEGER NOT NULL DEFAULT 0,
  "fileSize" TEXT,
  "publishedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "Report_slug_key" ON "Report"("slug");
CREATE INDEX IF NOT EXISTS "Report_categoryId_idx" ON "Report"("categoryId");
CREATE INDEX IF NOT EXISTS "Report_analystId_idx" ON "Report"("analystId");
CREATE INDEX IF NOT EXISTS "Report_isPublished_idx" ON "Report"("isPublished");

-- ReportTag junction table
CREATE TABLE IF NOT EXISTS "ReportTag" (
  "reportId" TEXT NOT NULL,
  "tagId" TEXT NOT NULL,
  PRIMARY KEY ("reportId", "tagId")
);

-- Downloads table
CREATE TABLE IF NOT EXISTS "Download" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT,
  "reportId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "Download_userId_idx" ON "Download"("userId");
CREATE INDEX IF NOT EXISTS "Download_reportId_idx" ON "Download"("reportId");

-- Bookmarks table
CREATE TABLE IF NOT EXISTS "Bookmark" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT,
  "reportId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "Bookmark_userId_reportId_key" ON "Bookmark"("userId", "reportId");
CREATE INDEX IF NOT EXISTS "Bookmark_userId_idx" ON "Bookmark"("userId");

-- ReportRequests table
CREATE TABLE IF NOT EXISTS "ReportRequest" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT,
  "reportType" TEXT NOT NULL,
  "companyName" TEXT,
  "notes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "adminNotes" TEXT,
  "reportId" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);
CREATE INDEX IF NOT EXISTS "ReportRequest_userId_idx" ON "ReportRequest"("userId");
CREATE INDEX IF NOT EXISTS "ReportRequest_status_idx" ON "ReportRequest"("status");

-- Notifications table
CREATE TABLE IF NOT EXISTS "Notification" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'INFO',
  "isRead" BOOLEAN NOT NULL DEFAULT 0,
  "link" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId");

-- Subscriptions table
CREATE TABLE IF NOT EXISTS "Subscription" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT,
  "analystId" TEXT,
  "plan" TEXT NOT NULL DEFAULT 'FREE',
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endDate" DATETIME,
  "price" REAL NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);
CREATE INDEX IF NOT EXISTS "Subscription_userId_idx" ON "Subscription"("userId");
CREATE INDEX IF NOT EXISTS "Subscription_analystId_idx" ON "Subscription"("analystId");

-- AnalystProfile table
CREATE TABLE IF NOT EXISTS "AnalystProfile" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "bio" TEXT,
  "expertise" TEXT,
  "publishedCount" INTEGER NOT NULL DEFAULT 0,
  "followerCount" INTEGER NOT NULL DEFAULT 0,
  "avgRating" REAL NOT NULL DEFAULT 0,
  "totalRevenue" REAL NOT NULL DEFAULT 0,
  "monthlyRevenue" REAL NOT NULL DEFAULT 0,
  "isVerified" BOOLEAN NOT NULL DEFAULT 0,
  "title" TEXT,
  "company" TEXT,
  "linkedin" TEXT,
  "twitter" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "AnalystProfile_userId_key" ON "AnalystProfile"("userId");

-- ForumPost table
CREATE TABLE IF NOT EXISTS "ForumPost" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT,
  "categoryId" TEXT,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "tags" TEXT,
  "upvotes" INTEGER NOT NULL DEFAULT 0,
  "downvotes" INTEGER NOT NULL DEFAULT 0,
  "viewCount" INTEGER NOT NULL DEFAULT 0,
  "commentCount" INTEGER NOT NULL DEFAULT 0,
  "isPinned" BOOLEAN NOT NULL DEFAULT 0,
  "isLocked" BOOLEAN NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);
CREATE INDEX IF NOT EXISTS "ForumPost_userId_idx" ON "ForumPost"("userId");
CREATE INDEX IF NOT EXISTS "ForumPost_categoryId_idx" ON "ForumPost"("categoryId");
CREATE INDEX IF NOT EXISTS "ForumPost_createdAt_idx" ON "ForumPost"("createdAt");

-- ForumComment table
CREATE TABLE IF NOT EXISTS "ForumComment" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "postId" TEXT NOT NULL,
  "userId" TEXT,
  "parentId" TEXT,
  "content" TEXT NOT NULL,
  "upvotes" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);
CREATE INDEX IF NOT EXISTS "ForumComment_postId_idx" ON "ForumComment"("postId");
CREATE INDEX IF NOT EXISTS "ForumComment_userId_idx" ON "ForumComment"("userId");

-- Follow table
CREATE TABLE IF NOT EXISTS "Follow" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "followerId" TEXT NOT NULL,
  "followingId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "Follow_followerId_followingId_key" ON "Follow"("followerId", "followingId");
CREATE INDEX IF NOT EXISTS "Follow_followerId_idx" ON "Follow"("followerId");
CREATE INDEX IF NOT EXISTS "Follow_followingId_idx" ON "Follow"("followingId");

-- UserBadge table
CREATE TABLE IF NOT EXISTS "UserBadge" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "badge" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "UserBadge_userId_badge_key" ON "UserBadge"("userId", "badge");
CREATE INDEX IF NOT EXISTS "UserBadge_userId_idx" ON "UserBadge"("userId");
