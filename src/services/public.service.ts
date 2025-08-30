import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';

export class PublicService {
  static async openAPI() {
    const filePath = path.join(process.cwd(), 'docs/swagger.yml');
    const fileContent = await fs.readFile(filePath, { encoding: 'utf-8' });
    return YAML.parse(fileContent);
  }
}
