import 'module-alias/register';
import path from 'path';

// Solo necesario si usas alias en el servidor
require('module-alias').addAliases({
  '@': path.join(__dirname, '../client/src'),
  '@shared': path.join(__dirname, '../shared'),
});