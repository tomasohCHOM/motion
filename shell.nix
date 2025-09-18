with import <nixpkgs> {
  config.allowUnfree = true;
};
mkShell {
  packages = [
    nodejs
    go
    go-tools
    minio
    delve
    terraform
    just
  ];
}
