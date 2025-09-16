with import <nixpkgs> {
  config.allowUnfree = true;
};
mkShell {
  packages = [
    nodejs
    go
    go-tools
    air
    delve
    terraform
    just
  ];
}
