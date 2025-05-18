import 'module-alias/register';
import path from 'path';
import moduleAlias from 'module-alias';

// Solo necesario si usas alias en el servidor
moduleAlias.addAliases({
  '@': path.join(__dirname, '../client/src'),
  '@shared': path.join(__dirname, '../shared'),
});
