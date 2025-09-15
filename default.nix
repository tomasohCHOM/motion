with import <nixpkgs> {
  config.allowUnfree = true;
};
mkShell {
  nativeBuildInputs = [
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
