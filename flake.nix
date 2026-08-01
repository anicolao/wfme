{
  description = "The War for Middle-earth browser game development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let pkgs = import nixpkgs { inherit system; };
      in {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            actionlint
            bash
            bun
            coreutils
            gh
            git
            jdk
            ripgrep
            shellcheck
          ];

          shellHook = ''
            # Keep downloaded browser and future Firebase emulator artifacts
            # stable across separate `nix develop --command` invocations.
            export XDG_CACHE_HOME="$PWD/.firebase/cache"
          '';
        };
      });
}
