declare module 'module-alias' {
    const moduleAlias: {
      addAliases(aliases: Record<string, string>): void;
      addAlias(alias: string, path: string): void;
    };
    export default moduleAlias;
  }
  