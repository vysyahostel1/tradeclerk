/**
 * TradeClerk - Turso Database Setup Script
 *
 * Run this to:
 * 1. Test Turso connection
 * 2. Create all tables
 * 3. Seed admin user with correct password hash
 * 4. Seed categories
 *
 * Usage: node scripts/setup-turso.mjs
 */

import { createClient } from '@libsql/client';
import { createHash } from 'crypto';

// ============================================================
// CONFIGURATION - Update these values
// ============================================================
const TURSO_URL = 'libsql://tradeclerk-vysyahostel1.aws-ap-south-1.turso.io';
const TURSO_AUTH_TOKEN = ''; // <-- PASTE YOUR NEW AUTH TOKEN HERE
const JWT_SECRET = ''; // <-- PASTE YOUR JWT_SECRET HERE (same as in Cloudflare)
const ADMIN_EMAIL = 'admin@tradeclerk.com';
const ADMIN_PASSWORD = 'Admin@123';
const ADMIN_NAME = 'Admin';

// ============================================================
// DO NOT EDIT BELOW THIS LINE
// ============================================================

function hashPassword(password, jwtSecret) {
  return createHash('sha256').update(password + jwtSecret).digest('hex');
}

async function main() {
  if (!TURSO_AUTH_TOKEN) {
    console.error('ERROR: Please set TURSO_AUTH_TOKEN in this script first!');
    console.error('   1. Go to https://turso.tech/app/databases/tradeclerk-vysyahostel1');
    console.error('   2. Click "Settings" > "Authentication"');
    console.error('   3. Generate a new auth token');
    console.error('   4. Paste it in this script');
    process.exit(1);
  }

  if (!JWT_SECRET) {
    console.error('ERROR: Please set JWT_SECRET in this script!');
    console.error('   Use the same value as JWT_SECRET in Cloudflare dashboard');
    process.exit(1);
  }

  console.log('Connecting to Turso...');
  const client = createClient({
    url: TURSO_URL,
    authToken: TURSO_AUTH_TOKEN,
  });

  // Test connection
  try {
    await client.execute('SELECT 1');
    console.log('Connected to Turso successfully!');
  } catch (err) {
    console.error('Connection failed:', err.message);
    if (err.message.includes('401')) {
      console.error('   Auth token is invalid or expired.');
      console.error('   Please generate a new token from Turso dashboard.');
    }
    process.exit(1);
  }

  // Create tables
  console.log('\nCreating tables...');
  const tables = [
    `CREATE TABLE IF NOT EXISTS "User" (
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
    )`,
    `CREATE TABLE IF NOT EXISTS "Category" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "description" TEXT,
      "icon" TEXT,
      "color" TEXT,
      "sortOrder" INTEGER NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      UNIQUE("name"), UNIQUE("slug")
    )`,
    `CREATE TABLE IF NOT EXISTS "Tag" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE("name"), UNIQUE("slug")
    )`,
    `CREATE TABLE IF NOT EXISTS "Report" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "title" TEXT NOT NULL, "slug" TEXT NOT NULL, "summary" TEXT, "content" TEXT,
      "coverImage" TEXT, "pdfUrl" TEXT, "analystId" TEXT, "categoryId" TEXT NOT NULL,
      "isPremium" BOOLEAN NOT NULL DEFAULT 0, "isPublished" BOOLEAN NOT NULL DEFAULT 0,
      "isFeatured" BOOLEAN NOT NULL DEFAULT 0, "viewCount" INTEGER NOT NULL DEFAULT 0,
      "downloadCount" INTEGER NOT NULL DEFAULT 0, "pageCount" INTEGER NOT NULL DEFAULT 0,
      "fileSize" TEXT, "publishedAt" DATETIME,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL,
      UNIQUE("slug"),
      CONSTRAINT "Report_analystId_fkey" FOREIGN KEY ("analystId") REFERENCES "User" ("id") ON DELETE SET NULL,
      CONSTRAINT "Report_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT
    )`,
    `CREATE TABLE IF NOT EXISTS "ReportTag" (
      "reportId" TEXT NOT NULL, "tagId" TEXT NOT NULL,
      CONSTRAINT "ReportTag_pkey" PRIMARY KEY ("reportId", "tagId"),
      CONSTRAINT "ReportTag_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report" ("id") ON DELETE CASCADE,
      CONSTRAINT "ReportTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS "Download" (
      "id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT, "reportId" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Download_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL,
      CONSTRAINT "Download_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report" ("id") ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS "Bookmark" (
      "id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT, "reportId" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE,
      CONSTRAINT "Bookmark_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report" ("id") ON DELETE CASCADE,
      UNIQUE("userId", "reportId")
    )`,
    `CREATE TABLE IF NOT EXISTS "ReportRequest" (
      "id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT, "reportType" TEXT NOT NULL,
      "companyName" TEXT, "notes" TEXT, "status" TEXT NOT NULL DEFAULT 'PENDING',
      "adminNotes" TEXT, "reportId" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL,
      CONSTRAINT "ReportRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "Notification" (
      "id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT, "title" TEXT NOT NULL,
      "message" TEXT NOT NULL, "type" TEXT NOT NULL DEFAULT 'INFO',
      "isRead" BOOLEAN NOT NULL DEFAULT 0, "link" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS "Subscription" (
      "id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT, "analystId" TEXT,
      "plan" TEXT NOT NULL DEFAULT 'FREE', "status" TEXT NOT NULL DEFAULT 'ACTIVE',
      "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "endDate" DATETIME,
      "price" REAL NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL,
      CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL,
      CONSTRAINT "Subscription_analystId_fkey" FOREIGN KEY ("analystId") REFERENCES "User" ("id") ON DELETE RESTRICT
    )`,
    `CREATE TABLE IF NOT EXISTS "AnalystProfile" (
      "id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL,
      "bio" TEXT, "expertise" TEXT, "publishedCount" INTEGER NOT NULL DEFAULT 0,
      "followerCount" INTEGER NOT NULL DEFAULT 0, "avgRating" REAL NOT NULL DEFAULT 0,
      "totalRevenue" REAL NOT NULL DEFAULT 0, "monthlyRevenue" REAL NOT NULL DEFAULT 0,
      "isVerified" BOOLEAN NOT NULL DEFAULT 0, "title" TEXT, "company" TEXT,
      "linkedin" TEXT, "twitter" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL,
      CONSTRAINT "AnalystProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE,
      UNIQUE("userId")
    )`,
    `CREATE TABLE IF NOT EXISTS "ForumPost" (
      "id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT, "categoryId" TEXT,
      "title" TEXT NOT NULL, "content" TEXT NOT NULL, "tags" TEXT,
      "upvotes" INTEGER NOT NULL DEFAULT 0, "downvotes" INTEGER NOT NULL DEFAULT 0,
      "viewCount" INTEGER NOT NULL DEFAULT 0, "commentCount" INTEGER NOT NULL DEFAULT 0,
      "isPinned" BOOLEAN NOT NULL DEFAULT 0, "isLocked" BOOLEAN NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL,
      CONSTRAINT "ForumPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL,
      CONSTRAINT "ForumPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "ForumComment" (
      "id" TEXT NOT NULL PRIMARY KEY, "postId" TEXT NOT NULL, "userId" TEXT, "parentId" TEXT,
      "content" TEXT NOT NULL, "upvotes" INTEGER NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL,
      CONSTRAINT "ForumComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ForumPost" ("id") ON DELETE CASCADE,
      CONSTRAINT "ForumComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "Follow" (
      "id" TEXT NOT NULL PRIMARY KEY, "followerId" TEXT NOT NULL, "followingId" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User" ("id") ON DELETE CASCADE,
      CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User" ("id") ON DELETE CASCADE,
      UNIQUE("followerId", "followingId")
    )`,
    `CREATE TABLE IF NOT EXISTS "UserBadge" (
      "id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL, "badge" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE,
      UNIQUE("userId", "badge")
    )`,
  ];

  for (const sql of tables) {
    try { await client.execute(sql); } catch (err) {
      if (!err.message.includes('already exists')) console.warn('  Warning:', err.message);
    }
  }
  console.log('All tables created/verified');

  // Seed admin user
  console.log('\nSeeding admin user...');
  const adminId = 'admin_' + Date.now();
  const passwordHash = hashPassword(ADMIN_PASSWORD, JWT_SECRET);

  console.log('   Email:', ADMIN_EMAIL);
  console.log('   Password:', ADMIN_PASSWORD);
  console.log('   JWT Secret used:', JWT_SECRET.substring(0, 4) + '...' + JWT_SECRET.substring(JWT_SECRET.length - 4));
  console.log('   Password Hash:', passwordHash);

  await client.execute({ sql: 'DELETE FROM "User" WHERE email = ?', args: [ADMIN_EMAIL] });
  await client.execute({
    sql: `INSERT INTO "User" (id, email, name, password, role, isVerified, isActive, karma, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, 1, 1, 100, datetime('now'), datetime('now'))`,
    args: [adminId, ADMIN_EMAIL, ADMIN_NAME, passwordHash, 'ADMIN'],
  });
  console.log('Admin user created');

  // Seed categories
  console.log('\nSeeding categories...');
  const categories = [
    { id: 'cat_equity', name: 'Equity Research', slug: 'equity-research', description: 'In-depth analysis of stocks and equity markets', icon: 'chart-line', color: '#3B82F6', order: 1 },
    { id: 'cat_macro', name: 'Macroeconomics', slug: 'macroeconomics', description: 'Global economic trends, policy analysis, and forecasts', icon: 'globe', color: '#10B981', order: 2 },
    { id: 'cat_sector', name: 'Sector Analysis', slug: 'sector-analysis', description: 'Industry and sector-specific research reports', icon: 'factory', color: '#F59E0B', order: 3 },
    { id: 'cat_commodities', name: 'Commodities', slug: 'commodities', description: 'Commodity markets, pricing, and supply-demand analysis', icon: 'droplets', color: '#EF4444', order: 4 },
    { id: 'cat_crypto', name: 'Cryptocurrency', slug: 'cryptocurrency', description: 'Digital assets, blockchain, and DeFi analysis', icon: 'bitcoin', color: '#8B5CF6', order: 5 },
    { id: 'cat_technical', name: 'Technical Analysis', slug: 'technical-analysis', description: 'Chart patterns, indicators, and trading strategies', icon: 'bar-chart', color: '#EC4899', order: 6 },
  ];

  for (const cat of categories) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO "Category" (id, name, slug, description, icon, color, sortOrder, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      args: [cat.id, cat.name, cat.slug, cat.description, cat.icon, cat.color, cat.order],
    });
  }
  console.log(categories.length + ' categories seeded');

  // Verify
  console.log('\nVerifying setup...');
  const userResult = await client.execute({ sql: 'SELECT id, email, role, password FROM "User" WHERE email = ?', args: [ADMIN_EMAIL] });
  const catResult = await client.execute('SELECT COUNT(*) as count FROM "Category"');
  const tableResult = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");

  console.log('\n=== SETUP COMPLETE ===');
  console.log('Admin:', userResult.rows[0]?.email, '(' + userResult.rows[0]?.role + ')');
  console.log('Categories:', catResult.rows[0]?.count);
  console.log('Tables:', tableResult.rows.length);

  console.log('\nNEXT STEPS:');
  console.log('1. Update TURSO_AUTH_TOKEN in Cloudflare dashboard with your new token');
  console.log('2. Make sure JWT_SECRET in Cloudflare matches the one used above');
  console.log('3. TURSO_URL is already set in wrangler.jsonc');
  console.log('4. Push this commit and wait for deployment');
  console.log('5. Login at your site with: admin@tradeclerk.com / Admin@123');
}

main().catch(console.error);
