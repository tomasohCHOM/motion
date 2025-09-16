with import <nixpkgs> {
  config.allowUnfree = true;
};
mkShell {
  packages = [
    nodejs
    go
    gotools
    air
    delve
    terraform
    just
  ];
}
