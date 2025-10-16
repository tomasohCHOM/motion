with import <nixpkgs> {
  config.allowUnfree = true;
};
mkShell {
  packages = [
    nodejs
    go
    go-tools
    delve
    terraform
    just
    xh
  ];
}
