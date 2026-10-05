import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const settingsPath = path.join(process.cwd(), 'src', 'data', 'settings.json');

export async function GET() {
  try {
    if (!fs.existsSync(settingsPath)) {
      return NextResponse.json({ cbtOpen: false });
    }
    const data = fs.readFileSync(settingsPath, 'utf8');
    return NextResponse.json(JSON.parse(data));
  } catch (err) {
    return NextResponse.json({ error: 'Failed to read settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const current = fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath, 'utf8')) : {};
    
    const newSettings = { ...current, ...body };
    fs.writeFileSync(settingsPath, JSON.stringify(newSettings, null, 2), 'utf8');
    
    return NextResponse.json(newSettings);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to write settings' }, { status: 500 });
  }
}
