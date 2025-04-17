{
  description = "TransAIJournaller - Next.js + TypeScript media transcription app";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in {
        devShell = pkgs.mkShell {
          buildInputs = [
            pkgs.nodejs_20
            pkgs.nodePackages.pnpm
            pkgs.git
            pkgs.ffmpeg # For media processing
          ];
          shellHook = ''
            echo "🚀 Welcome to the TransAIJournaller development environment!"
            echo "Run 'pnpm install' to install dependencies"
            echo "Run 'pnpm dev' to start the development server"
          '';
        };

        # Package definition for CI/CD
        packages.default = pkgs.stdenv.mkDerivation {
          pname = "transai-journaller";
          version = "0.1.0";
          src = ./.;
          
          buildInputs = [
            pkgs.nodejs_20
            pkgs.nodePackages.pnpm
          ];
          
          buildPhase = ''
            export HOME=$(mktemp -d)
            pnpm install --frozen-lockfile
            pnpm build
          '';
          
          installPhase = ''
            mkdir -p $out
            cp -r .next $out/
            cp -r public $out/
            cp next.config.ts $out/
            cp package.json $out/
          '';
        };
      }
    );
} 