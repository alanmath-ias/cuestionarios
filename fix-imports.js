// fix-imports.js
import { Project } from "ts-morph";
import path from "path";

const project = new Project({
  tsConfigFilePath: "./tsconfig.json",
});

const sourceFiles = project.getSourceFiles(["./server/**/*.ts", "./shared/**/*.ts"]);

sourceFiles.forEach((file) => {
  file.getImportDeclarations().forEach((importDecl) => {
    const moduleSpecifier = importDecl.getModuleSpecifierValue();

    if (
      (moduleSpecifier.startsWith("./") || moduleSpecifier.startsWith("../")) &&
      !moduleSpecifier.endsWith(".js")
    ) {
      importDecl.setModuleSpecifier(moduleSpecifier + ".js");
    }
  });

  file.saveSync();
});

console.log("✅ Imports actualizados con .js en paths relativos.");
