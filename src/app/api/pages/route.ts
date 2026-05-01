import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

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

export async function GET(request: Request) {
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

    // Return all page slugs and titles
    const summary = Object.entries(pages).map(([key, val]) => ({
      slug: key,
      title: val.title,
    }));

    return NextResponse.json({ pages: summary });
  } catch {
    return NextResponse.json({ error: 'Failed to read page content' }, { status: 500 });
  }
}
