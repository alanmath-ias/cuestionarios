import 'module-alias/register';
import path from 'path';
import moduleAlias from 'module-alias';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Equivalente a __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configurar los alias
moduleAlias.addAliases({
  '@': path.join(__dirname, '../client/src'),
  '@shared': path.join(__dirname, '../shared'),
});
