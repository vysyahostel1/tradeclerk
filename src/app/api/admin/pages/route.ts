import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

const PAGES_FILE = path.join(process.cwd(), 'src', 'lib', 'db', 'page-content.json');

interface PageSection {
  id: string;
  heading: string;
  content: string;
  type: string;
}

interface PageContent {
  title: string;
  heroSubtitle: string;
  sections: PageSection[];
}

type PagesData = Record<string, PageContent>;

async function readPages(): Promise<PagesData> {
  try {
    const raw = await fs.readFile(PAGES_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writePages(data: PagesData): Promise<void> {
  await fs.writeFile(PAGES_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// GET: Fetch all pages or a specific page (admin)
export async function GET(request: Request) {
  const token = getTokenFromHeader(request);
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const payload = await verifyToken(token);
  if (!payload || payload.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const pages = await readPages();

    if (slug) {
      const page = pages[slug];
      if (!page) {
        return NextResponse.json({ error: 'Page not found' }, { status: 404 });
      }
      return NextResponse.json({ page });
    }

    return NextResponse.json({ pages });
  } catch {
    return NextResponse.json({ error: 'Failed to read page content' }, { status: 500 });
  }
}

// PUT: Update entire page content
export async function PUT(request: Request) {
  const token = getTokenFromHeader(request);
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const payload = await verifyToken(token);
  if (!payload || payload.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { slug, page } = body;

    if (!slug || !page || !page.title || !page.sections) {
      return NextResponse.json({ error: 'Invalid request. Slug and page data are required.' }, { status: 400 });
    }

    const pages = await readPages();
    pages[slug] = page;
    await writePages(pages);

    return NextResponse.json({ message: 'Page updated successfully', page });
  } catch {
    return NextResponse.json({ error: 'Failed to update page content' }, { status: 500 });
  }
}

// POST: Add a new section to a page
export async function POST(request: Request) {
  const token = getTokenFromHeader(request);
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const payload = await verifyToken(token);
  if (!payload || payload.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { slug, action, section } = body;

    if (!slug || !action) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const pages = await readPages();

    if (!pages[slug]) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    if (action === 'add-section') {
      if (!section || !section.heading || !section.content) {
        return NextResponse.json({ error: 'Section heading and content are required' }, { status: 400 });
      }
      const newSection = {
        id: section.id || `section-${Date.now()}`,
        heading: section.heading,
        content: section.content,
        type: section.type || 'text',
      };
      pages[slug].sections.push(newSection);
      await writePages(pages);
      return NextResponse.json({ message: 'Section added', page: pages[slug] });
    }

    if (action === 'remove-section') {
      if (!section?.id) {
        return NextResponse.json({ error: 'Section ID is required' }, { status: 400 });
      }
      pages[slug].sections = pages[slug].sections.filter((s) => s.id !== section.id);
      await writePages(pages);
      return NextResponse.json({ message: 'Section removed', page: pages[slug] });
    }

    if (action === 'update-section') {
      if (!section?.id || !section.heading || !section.content) {
        return NextResponse.json({ error: 'Section ID, heading, and content are required' }, { status: 400 });
      }
      const idx = pages[slug].sections.findIndex((s) => s.id === section.id);
      if (idx === -1) {
        return NextResponse.json({ error: 'Section not found' }, { status: 404 });
      }
      pages[slug].sections[idx] = { ...pages[slug].sections[idx], ...section };
      await writePages(pages);
      return NextResponse.json({ message: 'Section updated', page: pages[slug] });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to perform action' }, { status: 500 });
  }
}

// DELETE: Remove a page
export async function DELETE(request: Request) {
  const token = getTokenFromHeader(request);
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const payload = await verifyToken(token);
  if (!payload || payload.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Page slug is required' }, { status: 400 });
    }

    const pages = await readPages();

    if (!pages[slug]) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    delete pages[slug];
    await writePages(pages);

    return NextResponse.json({ message: 'Page deleted successfully' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
  }
}
