{
  description = "canary-shop dev environment";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs =
    { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        packages = with pkgs; [
          jdk21
          maven
          docker-client
          docker-compose
          git
          postgresql
          jq
          curl
        ];

        shellHook = ''
          export JAVA_HOME=${pkgs.jdk21}/lib/openjdk
          echo "canary-shop shell ready: $(java -version 2>&1 | head -1)"
        '';
      };
    };
}
