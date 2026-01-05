import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import TexturePacker from 'free-tex-packer-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.resolve(__dirname, 'images'); // your source PNGs
const outputDir = path.resolve(__dirname, '../src/assets/sprites'); // target folder

async function getAllPngFiles(dir, fileList = []) {
  const files = await fs.readdir(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = await fs.stat(fullPath);
    if (stat.isDirectory()) {
      await getAllPngFiles(fullPath, fileList);
    } else if (file.endsWith('.png')) {
      const buffer = await fs.readFile(fullPath);
      fileList.push({
        path: path.relative(inputDir, fullPath),
        contents: buffer,
      });
    }
  }
  return fileList;
}


const images = await getAllPngFiles(inputDir);

TexturePacker(
  images,
  {
    textureName: 'spritesheet',
    width: 2048,
    height: 2048,
    allowRotation: false,
    allowTrim: true,
    prependFolderName: false,
    detectIdentical: true,
    trimMode: 'Trim',
    packer: 'MaxRectsBin',
    exporter: 'Pixi',
    multiAtlas: true,      // allow multiple pages
    multipage: true,       // allow multiple pages
    jsonFormat: 'pixi',
  },
  async (files, error) => {
    if (error) {
      console.error('[SpriteBuilder] Error packing sprites:', error);
      return;
    }

    await fs.mkdir(outputDir, { recursive: true });

    const pngFiles = files.filter(f => f.name.endsWith('.png'));
    for (const file of pngFiles) {
      await fs.writeFile(path.join(outputDir, file.name), file.buffer);
    }

    const jsonFile = files.find(f => f.name.endsWith('.json'));
    if (!jsonFile) {
      console.error('[SpriteBuilder] No JSON found in packer output!');
      return;
    }

    const jsonData = JSON.parse(jsonFile.buffer.toString());

    for (const png of pngFiles) {
      const singleJson = {
        ...jsonData,
        meta: {
          ...jsonData.meta,
          image: png.name
        }
      };

      const jsonName = `${path.parse(png.name).name}.json`;
      await fs.writeFile(
        path.join(outputDir, jsonName),
        Buffer.from(JSON.stringify(singleJson, null, 2))
      );
    }
  }
);
