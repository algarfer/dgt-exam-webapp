{ pkgs, ... }:
{
  packages = with pkgs; [
    git
    bun
  ];
}
