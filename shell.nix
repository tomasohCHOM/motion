with import <nixpkgs> {
  config.allowUnfree = true;
};
mkShell {
  packages = [
    nodejs
    eslint
    prettier
    go
    gotools
    air
    delve
    terraform
    justbuild
  ];
}
