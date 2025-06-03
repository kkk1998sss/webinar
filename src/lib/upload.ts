import { writeFile } from 'fs/promises';
import { mkdir } from 'fs/promises';
import { join } from 'path';

export async function saveFile(file: File, directory: string): Promise<string> {
  try {
    // Create directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', directory);
    await mkdir(uploadDir, { recursive: true });

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${uniqueSuffix}-${file.name}`;
    const filepath = join(uploadDir, filename);

    // Save file
    await writeFile(filepath, buffer);

    // Return the public URL
    return `/${directory}/${filename}`;
  } catch (error) {
    console.error('Error saving file:', error);
    throw new Error('Failed to save file');
  }
}
