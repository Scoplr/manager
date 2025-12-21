2025-12-21T11:54:43.985293182Z [inf]  
2025-12-21T11:54:44.433025613Z [inf]  [35m[Region: us-west1][0m
2025-12-21T11:54:44.444301604Z [inf]  [35m==============
2025-12-21T11:54:44.444329857Z [inf]  Using Nixpacks
2025-12-21T11:54:44.444336055Z [inf]  ==============
2025-12-21T11:54:44.444340091Z [inf]  [0m
2025-12-21T11:54:44.444420902Z [inf]  context: 456g-wO0C
2025-12-21T11:54:44.652265903Z [inf]  ╔════════════ Nixpacks v1.38.0 ════════════╗
2025-12-21T11:54:44.652319726Z [inf]  ║ setup      │ nodejs_22, npm-9_x, openssl ║
2025-12-21T11:54:44.652331256Z [inf]  ║──────────────────────────────────────────║
2025-12-21T11:54:44.652339608Z [inf]  ║ install    │ npm ci                      ║
2025-12-21T11:54:44.652352433Z [inf]  ║──────────────────────────────────────────║
2025-12-21T11:54:44.652361889Z [inf]  ║ build      │ npm run build               ║
2025-12-21T11:54:44.652371186Z [inf]  ║──────────────────────────────────────────║
2025-12-21T11:54:44.652380161Z [inf]  ║ start      │ npm run start               ║
2025-12-21T11:54:44.652388858Z [inf]  ╚══════════════════════════════════════════╝
2025-12-21T11:54:44.996969896Z [inf]  [internal] load build definition from Dockerfile
2025-12-21T11:54:44.997036745Z [inf]  [internal] load build definition from Dockerfile
2025-12-21T11:54:44.997065682Z [inf]  [internal] load build definition from Dockerfile
2025-12-21T11:54:44.997115343Z [inf]  [internal] load build definition from Dockerfile
2025-12-21T11:54:45.007936160Z [inf]  [internal] load build definition from Dockerfile
2025-12-21T11:54:45.010468239Z [inf]  [internal] load metadata for ghcr.io/railwayapp/nixpacks:ubuntu-1745885067
2025-12-21T11:54:45.225778630Z [inf]  [internal] load metadata for ghcr.io/railwayapp/nixpacks:ubuntu-1745885067
2025-12-21T11:54:45.226127642Z [inf]  [internal] load .dockerignore
2025-12-21T11:54:45.226184129Z [inf]  [internal] load .dockerignore
2025-12-21T11:54:45.226198716Z [inf]  [internal] load .dockerignore
2025-12-21T11:54:45.234509923Z [inf]  [internal] load .dockerignore
2025-12-21T11:54:45.242917998Z [inf]  [stage-0 10/10] COPY . /app
2025-12-21T11:54:45.242957417Z [inf]  [stage-0  9/10] RUN printf '\nPATH=/app/node_modules/.bin:$PATH' >> /root/.profile
2025-12-21T11:54:45.242968081Z [inf]  [stage-0  8/10] RUN --mount=type=cache,id=s/d75351e2-85e1-4a2b-baa2-706efbbc16f8-next/cache,target=/app/.next/cache --mount=type=cache,id=s/d75351e2-85e1-4a2b-baa2-706efbbc16f8-node_modules/cache,target=/app/node_modules/.cache npm run build
2025-12-21T11:54:45.242979617Z [inf]  [stage-0  7/10] COPY . /app/.
2025-12-21T11:54:45.242997988Z [inf]  [stage-0  6/10] RUN --mount=type=cache,id=s/d75351e2-85e1-4a2b-baa2-706efbbc16f8-/root/npm,target=/root/.npm npm ci
2025-12-21T11:54:45.243006864Z [inf]  [stage-0  5/10] COPY . /app/.
2025-12-21T11:54:45.243016797Z [inf]  [stage-0  4/10] RUN nix-env -if .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix && nix-collect-garbage -d
2025-12-21T11:54:45.243028601Z [inf]  [stage-0  3/10] COPY .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix
2025-12-21T11:54:45.243039237Z [inf]  [internal] load build context
2025-12-21T11:54:45.243049771Z [inf]  [stage-0  2/10] WORKDIR /app/
2025-12-21T11:54:45.243057499Z [inf]  [stage-0  1/10] FROM ghcr.io/railwayapp/nixpacks:ubuntu-1745885067@sha256:d45c89d80e13d7ad0fd555b5130f22a866d9dd10e861f589932303ef2314c7de
2025-12-21T11:54:45.243078204Z [inf]  [stage-0  1/10] FROM ghcr.io/railwayapp/nixpacks:ubuntu-1745885067@sha256:d45c89d80e13d7ad0fd555b5130f22a866d9dd10e861f589932303ef2314c7de
2025-12-21T11:54:45.243087074Z [inf]  [internal] load build context
2025-12-21T11:54:45.243097830Z [inf]  [internal] load build context
2025-12-21T11:54:45.336231857Z [inf]  [internal] load build context
2025-12-21T11:54:45.340760843Z [inf]  [stage-0  2/10] WORKDIR /app/
2025-12-21T11:54:45.340815314Z [inf]  [stage-0  3/10] COPY .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix
2025-12-21T11:54:45.360508247Z [inf]  [stage-0  3/10] COPY .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix
2025-12-21T11:54:45.361703225Z [inf]  [stage-0  4/10] RUN nix-env -if .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix && nix-collect-garbage -d
2025-12-21T11:54:45.56582025Z [inf]  unpacking 'https://github.com/NixOS/nixpkgs/archive/ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.tar.gz' into the Git cache...

2025-12-21T11:55:17.174291619Z [inf]  unpacking 'https://github.com/railwayapp/nix-npm-overlay/archive/main.tar.gz' into the Git cache...

2025-12-21T11:55:17.827258061Z [inf]  installing 'ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7-env'

2025-12-21T11:55:18.866683187Z [inf]  these 5 derivations will be built:
  /nix/store/6vy68gykpxfphbmmyd59ya88xvrwvvaa-npm-9.9.4.tgz.drv
  /nix/store/kmkgqwwal88b9lch9dl53iqa3wsm6vdb-libraries.drv
  /nix/store/91aaayacr12psqb9fmp8arg1xafgg9v2-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7-env.drv
  /nix/store/w9h0z1lhfwxc0m38f3w5brfdqrzm4wyj-npm.drv
  /nix/store/c6alp02sn7zlscxp5pv9b3mv6g7mnqr8-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7-env.drv

2025-12-21T11:55:18.866704008Z [inf]  these 86 paths will be fetched (126.25 MiB download, 593.56 MiB unpacked):
  /nix/store/cf7gkacyxmm66lwl5nj6j6yykbrg4q5c-acl-2.3.2
  /nix/store/a9jgnlhkjkxav6qrc3rzg2q84pkl2wvr-attr-2.5.2

2025-12-21T11:55:18.866707564Z [inf]    /nix/store/5mh7kaj2fyv8mk4sfq1brwxgc02884wi-bash-5.2p37
  /nix/store/j7p46r8v9gcpbxx89pbqlh61zhd33gzv-binutils-2.43.1
  /nix/store/df2a8k58k00f2dh2x930dg6xs6g6mliv-binutils-2.43.1-lib

2025-12-21T11:55:18.866753771Z [inf]    /nix/store/srcmmqi8kxjfygd0hyy42c8hv6cws83b-binutils-wrapper-2.43.1
  /nix/store/wf5zj2gbib3gjqllkabxaw4dh0gzcla3-builder.pl
  /nix/store/ivl2v8rgg7qh1jkj5pwpqycax3rc2hnl-bzip2-1.0.8
  /nix/store/mglixp03lsp0w986svwdvm7vcy17rdax-bzip2-1.0.8-bin
  /nix/store/4s9rah4cwaxflicsk5cndnknqlk9n4p3-coreutils-9.5
  /nix/store/pkc7mb4a4qvyz73srkqh4mwl70w98dsv-curl-8.11.0
  /nix/store/p123cq20klajcl9hj8jnkjip5nw6awhz-curl-8.11.0-bin
  /nix/store/5f5linrxzhhb3mrclkwdpm9bd8ygldna-curl-8.11.0-dev
  /nix/store/agvks3qmzja0yj54szi3vja6vx3cwkkw-curl-8.11.0-man
  /nix/store/00g69vw7c9lycy63h45ximy0wmzqx5y6-diffutils-3.10
  /nix/store/74h4z8k82pmp24xryflv4lxkz8jlpqqd-ed-1.20.2

2025-12-21T11:55:18.866773454Z [inf]    /nix/store/qbry6090vlr9ar33kdmmbq2p5apzbga8-expand-response-params
  /nix/store/c4rj90r2m89rxs64hmm857mipwjhig5d-file-5.46
  /nix/store/jqrz1vq5nz4lnv9pqzydj0ir58wbjfy1-findutils-4.10.0
  /nix/store/a3c47r5z1q2c4rz0kvq8hlilkhx2s718-gawk-5.3.1
  /nix/store/l89iqc7am6i60y8vk507zwrzxf0wcd3v-gcc-14-20241116
  /nix/store/bpq1s72cw9qb2fs8mnmlw6hn2c7iy0ss-gcc-14-20241116-lib
  /nix/store/17v0ywnr3akp85pvdi56gwl99ljv95kx-gcc-14-20241116-libgcc
  /nix/store/xcn9p4xxfbvlkpah7pwchpav4ab9d135-gcc-wrapper-14-20241116
  /nix/store/65h17wjrrlsj2rj540igylrx7fqcd6vq-glibc-2.40-36

2025-12-21T11:55:18.866779173Z [inf]    /nix/store/1c6bmxrrhm8bd26ai2rjqld2yyjrxhds-glibc-2.40-36-bin
  /nix/store/kj8hbqx4ds9qm9mq7hyikxyfwwg13kzj-glibc-2.40-36-dev
  /nix/store/kryrg7ds05iwcmy81amavk8w13y4lxbs-gmp-6.3.0
  /nix/store/a2byxfv4lc8f2g5xfzw8cz5q8k05wi29-gmp-with-cxx-6.3.0
  /nix/store/1m67ipsk39xvhyqrxnzv2m2p48pil8kl-gnu-config-2024-01-01
  /nix/store/aap6cq56amx4mzbyxp2wpgsf1kqjcr1f-gnugrep-3.11
  /nix/store/fp6cjl1zcmm6mawsnrb5yak1wkz2ma8l-gnumake-4.4.1

2025-12-21T11:55:18.866782338Z [inf]    /nix/store/abm77lnrkrkb58z6xp1qwjcr1xgkcfwm-gnused-4.9

2025-12-21T11:55:18.866826815Z [inf]    /nix/store/9cwwj1c9csmc85l2cqzs3h9hbf1vwl6c-gnutar-1.35
  /nix/store/nvvj6sk0k6px48436drlblf4gafgbvzr-gzip-1.13
  /nix/store/wwipgdqb4p2fr46kmw9c5wlk799kbl68-icu4c-74.2
  /nix/store/m8w3mf0i4862q22bxad0wspkgdy4jnkk-icu4c-74.2-dev
  /nix/store/xmbv8s4p4i4dbxgkgdrdfb0ym25wh6gk-isl-0.20
  /nix/store/2wh1gqyzf5xsvxpdz2k0bxiz583wwq29-keyutils-1.6.3-lib
  /nix/store/milph81dilrh96isyivh5n50agpx39k2-krb5-1.21.3
  /nix/store/b56mswksrql15knpb1bnhv3ysif340kd-krb5-1.21.3-dev

2025-12-21T11:55:18.86683924Z [inf]    /nix/store/v9c1s50x7magpiqgycxxkn36avzbcg0g-krb5-1.21.3-lib
  /nix/store/nlqind4szw3amcmhgy4pd2n0894558gg-libX11-1.8.10
  /nix/store/hjbxiwsc587b8dc6v6pisa34aj10hq23-libXau-1.0.11
  /nix/store/c9gk656q2x8av467r06hcjag31drjfzh-libXdmcp-1.1.5

2025-12-21T11:55:18.866859017Z [inf]    /nix/store/r87iqz07igmwfvb12mgr6rmpb6353ys4-libXext-1.3.6
  /nix/store/5mb70vg3kdzkyn0zqdgm4f87mdi0yi4i-libglvnd-1.7.0
  /nix/store/34z2792zyd4ayl5186vx0s98ckdaccz9-libidn2-2.3.7
  /nix/store/2a3anh8vl3fcgk0fvaravlimrqawawza-libmpc-1.3.1
  /nix/store/8675pnfr4fqnwv4pzjl67hdwls4q13aa-libssh2-1.11.1
  /nix/store/d7zhcrcc7q3yfbm3qkqpgc3daq82spwi-libssh2-1.11.1-dev
  /nix/store/xcqcgqazykf6s7fsn08k0blnh0wisdcl-libunistring-1.3
  /nix/store/r9ac2hwnmb0nxwsrvr6gi9wsqf2whfqj-libuv-1.49.2
  /nix/store/ll14czvpxglf6nnwmmrmygplm830fvlv-libuv-1.49.2-dev
  /nix/store/2j3c18398phz5c1376x2qvva8gx9g551-libxcb-1.17.0
  /nix/store/6cr0spsvymmrp1hj5n0kbaxw55w1lqyp-libxcrypt-4.4.36
  /nix/store/pc74azbkr19rkd5bjalq2xwx86cj3cga-linux-headers-6.12
  /nix/store/fv7gpnvg922frkh81w5hkdhpz0nw3iiz-mirrors-list
  /nix/store/qs22aazzrdd4dnjf9vffl0n31hvls43h-mpfr-4.2.1
  /nix/store/grixvx878884hy8x3xs0c0s1i00j632k-nghttp2-1.64.0
  /nix/store/dz97fw51rm5bl9kz1vg0haj1j1a7r1mr-nghttp2-1.64.0-dev

2025-12-21T11:55:18.866863915Z [inf]    /nix/store/qcghigzrz56vczwlzg9c02vbs6zr9jkz-nghttp2-1.64.0-lib

2025-12-21T11:55:18.866868684Z [inf]    /nix/store/fkyp1bm5gll9adnfcj92snyym524mdrj-nodejs-22.11.0
  /nix/store/9l9n7a0v4aibcz0sgd0crs209an9p7dz-openssl-3.3.2
  /nix/store/h1ydpxkw9qhjdxjpic1pdc2nirggyy6f-openssl-3.3.2

2025-12-21T11:55:18.866873596Z [inf]    /nix/store/lygl27c44xv73kx1spskcgvzwq7z337c-openssl-3.3.2-bin

2025-12-21T11:55:18.86688766Z [inf]    /nix/store/qq5q0alyzywdazhmybi7m69akz0ppk05-openssl-3.3.2-bin
  /nix/store/kqm7wpqkzc4bwjlzqizcbz0mgkj06a9x-openssl-3.3.2-dev
  /nix/store/pp2zf8bdgyz60ds8vcshk2603gcjgp72-openssl-3.3.2-dev
  /nix/store/q10wlq1brcnc21v5qvhbj9fwlf806dgm-openssl-3.3.2-man
  /nix/store/5yja5dpk2qw1v5mbfbl2d7klcdfrh90w-patch-2.7.6

2025-12-21T11:55:18.866891794Z [inf]    /nix/store/srfxqk119fijwnprgsqvn68ys9kiw0bn-patchelf-0.15.0
  /nix/store/3j1p598fivxs69wx3a657ysv3rw8k06l-pcre2-10.44

2025-12-21T11:55:18.866894861Z [inf]    /nix/store/1i003ijlh9i0mzp6alqby5hg3090pjdx-perl-5.40.0

2025-12-21T11:55:18.86691359Z [inf]    /nix/store/dj96qp9vps02l3n8xgc2vallqa9rhafb-sqlite-3.47.0
  /nix/store/yc39wvfz87i0bl8r6vnhq48n6clbx2pb-sqlite-3.47.0-bin
  /nix/store/i47d0rzbbnihcxkcaj48jgii5pj58djc-sqlite-3.47.0-dev
  /nix/store/4ig84cyqi6qy4n0sanrbzsw1ixa497jx-stdenv-linux
  /nix/store/d0gfdcag8bxzvg7ww4s7px4lf8sxisyx-stdenv-linux

2025-12-21T11:55:18.866917605Z [inf]    /nix/store/d29r1bdmlvwmj52apgcdxfl1mm9c5782-update-autotools-gnu-config-scripts-hook

2025-12-21T11:55:18.866921459Z [inf]    /nix/store/2phvd8h14vwls0da1kmsxc73vzmhkm3b-util-linux-minimal-2.39.4-lib
  /nix/store/acfkqzj5qrqs88a4a6ixnybbjxja663d-xgcc-14-20241116-libgcc

2025-12-21T11:55:18.866927805Z [inf]    /nix/store/c2njy6bv84kw1i4bjf5k5gn7gz8hn57n-xz-5.6.3

2025-12-21T11:55:18.866930831Z [inf]    /nix/store/h18s640fnhhj2qdh5vivcfbxvz377srg-xz-5.6.3-bin
  /nix/store/cqlaa2xf6lslnizyj9xqa8j0ii1yqw0x-zlib-1.3.1
  /nix/store/1lggwqzapn5mn49l9zy4h566ysv9kzdb-zlib-1.3.1-dev

2025-12-21T11:55:18.874835822Z [inf]  copying path '/nix/store/wf5zj2gbib3gjqllkabxaw4dh0gzcla3-builder.pl' from 'https://cache.nixos.org'...

2025-12-21T11:55:18.876749558Z [inf]  copying path '/nix/store/q10wlq1brcnc21v5qvhbj9fwlf806dgm-openssl-3.3.2-man' from 'https://cache.nixos.org'...

2025-12-21T11:55:18.879206675Z [inf]  copying path '/nix/store/17v0ywnr3akp85pvdi56gwl99ljv95kx-gcc-14-20241116-libgcc' from 'https://cache.nixos.org'...
copying path '/nix/store/1m67ipsk39xvhyqrxnzv2m2p48pil8kl-gnu-config-2024-01-01' from 'https://cache.nixos.org'...

2025-12-21T11:55:18.879768687Z [inf]  copying path '/nix/store/acfkqzj5qrqs88a4a6ixnybbjxja663d-xgcc-14-20241116-libgcc' from 'https://cache.nixos.org'...

2025-12-21T11:55:18.880077924Z [inf]  copying path '/nix/store/xcqcgqazykf6s7fsn08k0blnh0wisdcl-libunistring-1.3' from 'https://cache.nixos.org'...

2025-12-21T11:55:18.883777351Z [inf]  copying path '/nix/store/pc74azbkr19rkd5bjalq2xwx86cj3cga-linux-headers-6.12' from 'https://cache.nixos.org'...

2025-12-21T11:55:18.883847826Z [inf]  copying path '/nix/store/fv7gpnvg922frkh81w5hkdhpz0nw3iiz-mirrors-list' from 'https://cache.nixos.org'...

2025-12-21T11:55:18.88424565Z [inf]  copying path '/nix/store/agvks3qmzja0yj54szi3vja6vx3cwkkw-curl-8.11.0-man' from 'https://cache.nixos.org'...

2025-12-21T11:55:18.885206249Z [inf]  copying path '/nix/store/grixvx878884hy8x3xs0c0s1i00j632k-nghttp2-1.64.0' from 'https://cache.nixos.org'...

2025-12-21T11:55:18.89980369Z [inf]  copying path '/nix/store/d29r1bdmlvwmj52apgcdxfl1mm9c5782-update-autotools-gnu-config-scripts-hook' from 'https://cache.nixos.org'...

2025-12-21T11:55:18.954810529Z [inf]  copying path '/nix/store/34z2792zyd4ayl5186vx0s98ckdaccz9-libidn2-2.3.7' from 'https://cache.nixos.org'...

2025-12-21T11:55:18.9816496Z [inf]  copying path '/nix/store/65h17wjrrlsj2rj540igylrx7fqcd6vq-glibc-2.40-36' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.576136054Z [inf]  copying path '/nix/store/a9jgnlhkjkxav6qrc3rzg2q84pkl2wvr-attr-2.5.2' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.576167145Z [inf]  copying path '/nix/store/5mh7kaj2fyv8mk4sfq1brwxgc02884wi-bash-5.2p37' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.576313976Z [inf]  copying path '/nix/store/qbry6090vlr9ar33kdmmbq2p5apzbga8-expand-response-params' from 'https://cache.nixos.org'...
copying path '/nix/store/74h4z8k82pmp24xryflv4lxkz8jlpqqd-ed-1.20.2' from 'https://cache.nixos.org'...
copying path '/nix/store/bpq1s72cw9qb2fs8mnmlw6hn2c7iy0ss-gcc-14-20241116-lib' from 'https://cache.nixos.org'...
copying path '/nix/store/1c6bmxrrhm8bd26ai2rjqld2yyjrxhds-glibc-2.40-36-bin' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.576391702Z [inf]  copying path '/nix/store/ivl2v8rgg7qh1jkj5pwpqycax3rc2hnl-bzip2-1.0.8' from 'https://cache.nixos.org'...
copying path '/nix/store/abm77lnrkrkb58z6xp1qwjcr1xgkcfwm-gnused-4.9' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.576460673Z [inf]  copying path '/nix/store/a3c47r5z1q2c4rz0kvq8hlilkhx2s718-gawk-5.3.1' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.576492663Z [inf]  copying path '/nix/store/kryrg7ds05iwcmy81amavk8w13y4lxbs-gmp-6.3.0' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.5765522Z [inf]  copying path '/nix/store/hjbxiwsc587b8dc6v6pisa34aj10hq23-libXau-1.0.11' from 'https://cache.nixos.org'...
copying path '/nix/store/fp6cjl1zcmm6mawsnrb5yak1wkz2ma8l-gnumake-4.4.1' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.576624678Z [inf]  copying path '/nix/store/r9ac2hwnmb0nxwsrvr6gi9wsqf2whfqj-libuv-1.49.2' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.576862552Z [inf]  copying path '/nix/store/c9gk656q2x8av467r06hcjag31drjfzh-libXdmcp-1.1.5' from 'https://cache.nixos.org'...
copying path '/nix/store/2wh1gqyzf5xsvxpdz2k0bxiz583wwq29-keyutils-1.6.3-lib' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.616963357Z [inf]  copying path '/nix/store/6cr0spsvymmrp1hj5n0kbaxw55w1lqyp-libxcrypt-4.4.36' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.620323055Z [inf]  copying path '/nix/store/qcghigzrz56vczwlzg9c02vbs6zr9jkz-nghttp2-1.64.0-lib' from 'https://cache.nixos.org'...
copying path '/nix/store/9l9n7a0v4aibcz0sgd0crs209an9p7dz-openssl-3.3.2' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.621155321Z [inf]  copying path '/nix/store/mglixp03lsp0w986svwdvm7vcy17rdax-bzip2-1.0.8-bin' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.626986126Z [inf]  copying path '/nix/store/cf7gkacyxmm66lwl5nj6j6yykbrg4q5c-acl-2.3.2' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.62910429Z [inf]  copying path '/nix/store/h1ydpxkw9qhjdxjpic1pdc2nirggyy6f-openssl-3.3.2' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.630006711Z [inf]  copying path '/nix/store/5yja5dpk2qw1v5mbfbl2d7klcdfrh90w-patch-2.7.6' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.633013929Z [inf]  copying path '/nix/store/2j3c18398phz5c1376x2qvva8gx9g551-libxcb-1.17.0' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.635706922Z [inf]  copying path '/nix/store/3j1p598fivxs69wx3a657ysv3rw8k06l-pcre2-10.44' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.638479877Z [inf]  copying path '/nix/store/2phvd8h14vwls0da1kmsxc73vzmhkm3b-util-linux-minimal-2.39.4-lib' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.643423288Z [inf]  copying path '/nix/store/ll14czvpxglf6nnwmmrmygplm830fvlv-libuv-1.49.2-dev' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.645688851Z [inf]  copying path '/nix/store/9cwwj1c9csmc85l2cqzs3h9hbf1vwl6c-gnutar-1.35' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.651774189Z [inf]  copying path '/nix/store/dz97fw51rm5bl9kz1vg0haj1j1a7r1mr-nghttp2-1.64.0-dev' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.652741181Z [inf]  copying path '/nix/store/xmbv8s4p4i4dbxgkgdrdfb0ym25wh6gk-isl-0.20' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.65564902Z [inf]  copying path '/nix/store/qs22aazzrdd4dnjf9vffl0n31hvls43h-mpfr-4.2.1' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.661044257Z [inf]  copying path '/nix/store/c2njy6bv84kw1i4bjf5k5gn7gz8hn57n-xz-5.6.3' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.661280119Z [inf]  copying path '/nix/store/nvvj6sk0k6px48436drlblf4gafgbvzr-gzip-1.13' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.667944515Z [inf]  copying path '/nix/store/cqlaa2xf6lslnizyj9xqa8j0ii1yqw0x-zlib-1.3.1' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.681903202Z [inf]  copying path '/nix/store/df2a8k58k00f2dh2x930dg6xs6g6mliv-binutils-2.43.1-lib' from 'https://cache.nixos.org'...
copying path '/nix/store/c4rj90r2m89rxs64hmm857mipwjhig5d-file-5.46' from 'https://cache.nixos.org'...
copying path '/nix/store/dj96qp9vps02l3n8xgc2vallqa9rhafb-sqlite-3.47.0' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.681924458Z [inf]  copying path '/nix/store/yc39wvfz87i0bl8r6vnhq48n6clbx2pb-sqlite-3.47.0-bin' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.686067602Z [inf]  copying path '/nix/store/1lggwqzapn5mn49l9zy4h566ysv9kzdb-zlib-1.3.1-dev' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.688356221Z [inf]  copying path '/nix/store/nlqind4szw3amcmhgy4pd2n0894558gg-libX11-1.8.10' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.696810348Z [inf]  copying path '/nix/store/kj8hbqx4ds9qm9mq7hyikxyfwwg13kzj-glibc-2.40-36-dev' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.696909877Z [inf]  copying path '/nix/store/h18s640fnhhj2qdh5vivcfbxvz377srg-xz-5.6.3-bin' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.69927642Z [inf]  copying path '/nix/store/2a3anh8vl3fcgk0fvaravlimrqawawza-libmpc-1.3.1' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.705816047Z [inf]  copying path '/nix/store/aap6cq56amx4mzbyxp2wpgsf1kqjcr1f-gnugrep-3.11' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.769140635Z [inf]  copying path '/nix/store/i47d0rzbbnihcxkcaj48jgii5pj58djc-sqlite-3.47.0-dev' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.78476495Z [inf]  copying path '/nix/store/r87iqz07igmwfvb12mgr6rmpb6353ys4-libXext-1.3.6' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.79784331Z [inf]  copying path '/nix/store/5mb70vg3kdzkyn0zqdgm4f87mdi0yi4i-libglvnd-1.7.0' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.803573445Z [inf]  copying path '/nix/store/v9c1s50x7magpiqgycxxkn36avzbcg0g-krb5-1.21.3-lib' from 'https://cache.nixos.org'...
copying path '/nix/store/8675pnfr4fqnwv4pzjl67hdwls4q13aa-libssh2-1.11.1' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.803589031Z [inf]  copying path '/nix/store/qq5q0alyzywdazhmybi7m69akz0ppk05-openssl-3.3.2-bin' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.820813843Z [inf]  copying path '/nix/store/j7p46r8v9gcpbxx89pbqlh61zhd33gzv-binutils-2.43.1' from 'https://cache.nixos.org'...
copying path '/nix/store/l89iqc7am6i60y8vk507zwrzxf0wcd3v-gcc-14-20241116' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.820835391Z [inf]  copying path '/nix/store/a2byxfv4lc8f2g5xfzw8cz5q8k05wi29-gmp-with-cxx-6.3.0' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.820902466Z [inf]  copying path '/nix/store/wwipgdqb4p2fr46kmw9c5wlk799kbl68-icu4c-74.2' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.820998601Z [inf]  copying path '/nix/store/srfxqk119fijwnprgsqvn68ys9kiw0bn-patchelf-0.15.0' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.822462658Z [inf]  copying path '/nix/store/lygl27c44xv73kx1spskcgvzwq7z337c-openssl-3.3.2-bin' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.843405433Z [inf]  copying path '/nix/store/kqm7wpqkzc4bwjlzqizcbz0mgkj06a9x-openssl-3.3.2-dev' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.857912358Z [inf]  copying path '/nix/store/4s9rah4cwaxflicsk5cndnknqlk9n4p3-coreutils-9.5' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.862866534Z [inf]  copying path '/nix/store/pp2zf8bdgyz60ds8vcshk2603gcjgp72-openssl-3.3.2-dev' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.880453959Z [inf]  copying path '/nix/store/pkc7mb4a4qvyz73srkqh4mwl70w98dsv-curl-8.11.0' from 'https://cache.nixos.org'...
copying path '/nix/store/milph81dilrh96isyivh5n50agpx39k2-krb5-1.21.3' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.931745054Z [inf]  copying path '/nix/store/d7zhcrcc7q3yfbm3qkqpgc3daq82spwi-libssh2-1.11.1-dev' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.960772151Z [inf]  copying path '/nix/store/b56mswksrql15knpb1bnhv3ysif340kd-krb5-1.21.3-dev' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.962083215Z [inf]  copying path '/nix/store/p123cq20klajcl9hj8jnkjip5nw6awhz-curl-8.11.0-bin' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.978127829Z [inf]  copying path '/nix/store/00g69vw7c9lycy63h45ximy0wmzqx5y6-diffutils-3.10' from 'https://cache.nixos.org'...
copying path '/nix/store/jqrz1vq5nz4lnv9pqzydj0ir58wbjfy1-findutils-4.10.0' from 'https://cache.nixos.org'...

2025-12-21T11:55:19.978193588Z [inf]  copying path '/nix/store/1i003ijlh9i0mzp6alqby5hg3090pjdx-perl-5.40.0' from 'https://cache.nixos.org'...

2025-12-21T11:55:20.009041215Z [inf]  copying path '/nix/store/5f5linrxzhhb3mrclkwdpm9bd8ygldna-curl-8.11.0-dev' from 'https://cache.nixos.org'...

2025-12-21T11:55:20.060235452Z [inf]  copying path '/nix/store/4ig84cyqi6qy4n0sanrbzsw1ixa497jx-stdenv-linux' from 'https://cache.nixos.org'...

2025-12-21T11:55:20.141826411Z [inf]  building '/nix/store/kmkgqwwal88b9lch9dl53iqa3wsm6vdb-libraries.drv'...

2025-12-21T11:55:20.19032385Z [inf]  building '/nix/store/6vy68gykpxfphbmmyd59ya88xvrwvvaa-npm-9.9.4.tgz.drv'...

2025-12-21T11:55:20.406718131Z [inf]  building '/nix/store/91aaayacr12psqb9fmp8arg1xafgg9v2-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7-env.drv'...

2025-12-21T11:55:20.450309167Z [inf]  copying path '/nix/store/srcmmqi8kxjfygd0hyy42c8hv6cws83b-binutils-wrapper-2.43.1' from 'https://cache.nixos.org'...

2025-12-21T11:55:20.510927616Z [inf]  
trying https://registry.npmjs.org/npm/-/npm-9.9.4.tgz
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed

2025-12-21T11:55:20.587578462Z [inf]  100 2648k  100 2648k    0     0  29.7M      0 --:--:-- --:--:-- --:--:-- 30.0M

2025-12-21T11:55:20.737947257Z [inf]  copying path '/nix/store/m8w3mf0i4862q22bxad0wspkgdy4jnkk-icu4c-74.2-dev' from 'https://cache.nixos.org'...

2025-12-21T11:55:20.848325325Z [inf]  copying path '/nix/store/fkyp1bm5gll9adnfcj92snyym524mdrj-nodejs-22.11.0' from 'https://cache.nixos.org'...

2025-12-21T11:55:24.369642364Z [inf]  copying path '/nix/store/xcn9p4xxfbvlkpah7pwchpav4ab9d135-gcc-wrapper-14-20241116' from 'https://cache.nixos.org'...

2025-12-21T11:55:24.391106852Z [inf]  copying path '/nix/store/d0gfdcag8bxzvg7ww4s7px4lf8sxisyx-stdenv-linux' from 'https://cache.nixos.org'...

2025-12-21T11:55:24.458455305Z [inf]  building '/nix/store/w9h0z1lhfwxc0m38f3w5brfdqrzm4wyj-npm.drv'...

2025-12-21T11:55:24.530839756Z [inf]  Running phase: unpackPhase

2025-12-21T11:55:24.537537199Z [inf]  unpacking source archive /nix/store/fkd1ma3nify8r9wp463yg5rqz9hdcyf1-npm-9.9.4.tgz

2025-12-21T11:55:24.656853338Z [inf]  source root is package

2025-12-21T11:55:24.714692569Z [inf]  setting SOURCE_DATE_EPOCH to timestamp 499162500 of file package/package.json

2025-12-21T11:55:24.72099858Z [inf]  Running phase: installPhase

2025-12-21T11:55:25.472661894Z [inf]  building '/nix/store/c6alp02sn7zlscxp5pv9b3mv6g7mnqr8-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7-env.drv'...

2025-12-21T11:55:25.581408121Z [inf]  created 423 symlinks in user environment

2025-12-21T11:55:25.78814774Z [inf]  building '/nix/store/y2dnafifln20snq952hxijcrrfb41n11-user-environment.drv'...

2025-12-21T11:55:25.951974699Z [inf]  removing old generations of profile /nix/var/nix/profiles/per-user/root/channels

2025-12-21T11:55:25.952198432Z [inf]  removing old generations of profile /nix/var/nix/profiles/per-user/root/profile

2025-12-21T11:55:25.952211951Z [inf]  removing profile version 1

2025-12-21T11:55:25.952436766Z [inf]  removing old generations of profile /nix/var/nix/profiles/per-user/root/channels

2025-12-21T11:55:25.952581944Z [inf]  removing old generations of profile /nix/var/nix/profiles/per-user/root/profile

2025-12-21T11:55:25.956002737Z [inf]  finding garbage collector roots...

2025-12-21T11:55:25.956117164Z [inf]  removing stale link from '/nix/var/nix/gcroots/auto/lzjbmb2ry0z7lma2fvpqprb12921pnb5' to '/nix/var/nix/profiles/per-user/root/profile-1-link'

2025-12-21T11:55:25.961333457Z [inf]  deleting garbage...

2025-12-21T11:55:25.964511494Z [inf]  deleting '/nix/store/a9qf4wwhympzs35ncp80r185j6a21w07-user-environment'

2025-12-21T11:55:25.965198086Z [inf]  deleting '/nix/store/253kwn1730vnay87xkjgxa2v97w3y079-user-environment.drv'

2025-12-21T11:55:25.96538007Z [inf]  deleting '/nix/store/hn5mrh362n52x8wwab9s1v6bgn4n5c94-env-manifest.nix'

2025-12-21T11:55:25.98694741Z [inf]  deleting '/nix/store/d0gfdcag8bxzvg7ww4s7px4lf8sxisyx-stdenv-linux'

2025-12-21T11:55:25.987269976Z [inf]  deleting '/nix/store/4ig84cyqi6qy4n0sanrbzsw1ixa497jx-stdenv-linux'

2025-12-21T11:55:25.987561767Z [inf]  deleting '/nix/store/h18s640fnhhj2qdh5vivcfbxvz377srg-xz-5.6.3-bin'

2025-12-21T11:55:25.988150315Z [inf]  deleting '/nix/store/xcn9p4xxfbvlkpah7pwchpav4ab9d135-gcc-wrapper-14-20241116'

2025-12-21T11:55:25.988747099Z [inf]  deleting '/nix/store/aap6cq56amx4mzbyxp2wpgsf1kqjcr1f-gnugrep-3.11'

2025-12-21T11:55:25.99169433Z [inf]  deleting '/nix/store/1i003ijlh9i0mzp6alqby5hg3090pjdx-perl-5.40.0'

2025-12-21T11:55:26.016810262Z [inf]  deleting '/nix/store/9cwwj1c9csmc85l2cqzs3h9hbf1vwl6c-gnutar-1.35'

2025-12-21T11:55:26.019584623Z [inf]  deleting '/nix/store/c2njy6bv84kw1i4bjf5k5gn7gz8hn57n-xz-5.6.3'

2025-12-21T11:55:26.021421148Z [inf]  deleting '/nix/store/jqrz1vq5nz4lnv9pqzydj0ir58wbjfy1-findutils-4.10.0'

2025-12-21T11:55:26.024210039Z [inf]  deleting '/nix/store/fv7gpnvg922frkh81w5hkdhpz0nw3iiz-mirrors-list'

2025-12-21T11:55:26.024485785Z [inf]  deleting '/nix/store/5f5linrxzhhb3mrclkwdpm9bd8ygldna-curl-8.11.0-dev'

2025-12-21T11:55:26.024984169Z [inf]  deleting '/nix/store/dz97fw51rm5bl9kz1vg0haj1j1a7r1mr-nghttp2-1.64.0-dev'

2025-12-21T11:55:26.025411339Z [inf]  deleting '/nix/store/fkd1ma3nify8r9wp463yg5rqz9hdcyf1-npm-9.9.4.tgz'

2025-12-21T11:55:26.02672532Z [inf]  deleting '/nix/store/srcmmqi8kxjfygd0hyy42c8hv6cws83b-binutils-wrapper-2.43.1'

2025-12-21T11:55:26.027383792Z [inf]  deleting '/nix/store/qbry6090vlr9ar33kdmmbq2p5apzbga8-expand-response-params'

2025-12-21T11:55:26.027677755Z [inf]  deleting '/nix/store/abm77lnrkrkb58z6xp1qwjcr1xgkcfwm-gnused-4.9'

2025-12-21T11:55:26.030292209Z [inf]  deleting '/nix/store/mglixp03lsp0w986svwdvm7vcy17rdax-bzip2-1.0.8-bin'

2025-12-21T11:55:26.030620409Z [inf]  deleting '/nix/store/wf5zj2gbib3gjqllkabxaw4dh0gzcla3-builder.pl'

2025-12-21T11:55:26.030795749Z [inf]  deleting '/nix/store/p123cq20klajcl9hj8jnkjip5nw6awhz-curl-8.11.0-bin'

2025-12-21T11:55:26.031244643Z [inf]  deleting '/nix/store/d7zhcrcc7q3yfbm3qkqpgc3daq82spwi-libssh2-1.11.1-dev'

2025-12-21T11:55:26.031580453Z [inf]  deleting '/nix/store/kqm7wpqkzc4bwjlzqizcbz0mgkj06a9x-openssl-3.3.2-dev'

2025-12-21T11:55:26.033185271Z [inf]  deleting '/nix/store/qq5q0alyzywdazhmybi7m69akz0ppk05-openssl-3.3.2-bin'

2025-12-21T11:55:26.03348383Z [inf]  deleting '/nix/store/5yja5dpk2qw1v5mbfbl2d7klcdfrh90w-patch-2.7.6'

2025-12-21T11:55:26.033705168Z [inf]  deleting '/nix/store/74h4z8k82pmp24xryflv4lxkz8jlpqqd-ed-1.20.2'

2025-12-21T11:55:26.034363569Z [inf]  deleting '/nix/store/pkc7mb4a4qvyz73srkqh4mwl70w98dsv-curl-8.11.0'

2025-12-21T11:55:26.034567098Z [inf]  deleting '/nix/store/b56mswksrql15knpb1bnhv3ysif340kd-krb5-1.21.3-dev'

2025-12-21T11:55:26.035419472Z [inf]  deleting '/nix/store/milph81dilrh96isyivh5n50agpx39k2-krb5-1.21.3'

2025-12-21T11:55:26.036257461Z [inf]  deleting '/nix/store/v9c1s50x7magpiqgycxxkn36avzbcg0g-krb5-1.21.3-lib'

2025-12-21T11:55:26.037200206Z [inf]  deleting '/nix/store/8675pnfr4fqnwv4pzjl67hdwls4q13aa-libssh2-1.11.1'

2025-12-21T11:55:26.0373833Z [inf]  deleting '/nix/store/9l9n7a0v4aibcz0sgd0crs209an9p7dz-openssl-3.3.2'

2025-12-21T11:55:26.038022545Z [inf]  deleting '/nix/store/l89iqc7am6i60y8vk507zwrzxf0wcd3v-gcc-14-20241116'

2025-12-21T11:55:26.054636839Z [inf]  deleting '/nix/store/2a3anh8vl3fcgk0fvaravlimrqawawza-libmpc-1.3.1'

2025-12-21T11:55:26.054919217Z [inf]  deleting '/nix/store/qs22aazzrdd4dnjf9vffl0n31hvls43h-mpfr-4.2.1'

2025-12-21T11:55:26.055173375Z [inf]  deleting '/nix/store/lwi59jcfwk2lnrakmm1y5vw85hj3n1bi-source'

2025-12-21T11:55:27.365548252Z [inf]  deleting '/nix/store/qcghigzrz56vczwlzg9c02vbs6zr9jkz-nghttp2-1.64.0-lib'

2025-12-21T11:55:27.365954723Z [inf]  deleting '/nix/store/q18dr5dwsfr7qfryfzlczgyw4xqsc4vw-source'

2025-12-21T11:55:27.367030879Z [inf]  deleting '/nix/store/3j1p598fivxs69wx3a657ysv3rw8k06l-pcre2-10.44'

2025-12-21T11:55:27.367467884Z [inf]  deleting '/nix/store/6cr0spsvymmrp1hj5n0kbaxw55w1lqyp-libxcrypt-4.4.36'

2025-12-21T11:55:27.36807944Z [inf]  deleting '/nix/store/j7p46r8v9gcpbxx89pbqlh61zhd33gzv-binutils-2.43.1'

2025-12-21T11:55:27.372510492Z [inf]  deleting '/nix/store/df2a8k58k00f2dh2x930dg6xs6g6mliv-binutils-2.43.1-lib'

2025-12-21T11:55:27.373144288Z [inf]  deleting '/nix/store/xmbv8s4p4i4dbxgkgdrdfb0ym25wh6gk-isl-0.20'

2025-12-21T11:55:27.374745032Z [inf]  deleting '/nix/store/fp6cjl1zcmm6mawsnrb5yak1wkz2ma8l-gnumake-4.4.1'

2025-12-21T11:55:27.376865678Z [inf]  deleting '/nix/store/kj8hbqx4ds9qm9mq7hyikxyfwwg13kzj-glibc-2.40-36-dev'

2025-12-21T11:55:27.382308903Z [inf]  deleting '/nix/store/1c6bmxrrhm8bd26ai2rjqld2yyjrxhds-glibc-2.40-36-bin'

2025-12-21T11:55:27.382729887Z [inf]  deleting '/nix/store/d29r1bdmlvwmj52apgcdxfl1mm9c5782-update-autotools-gnu-config-scripts-hook'

2025-12-21T11:55:27.383036539Z [inf]  deleting '/nix/store/00g69vw7c9lycy63h45ximy0wmzqx5y6-diffutils-3.10'

2025-12-21T11:55:27.385486927Z [inf]  deleting '/nix/store/nvvj6sk0k6px48436drlblf4gafgbvzr-gzip-1.13'

2025-12-21T11:55:27.38582228Z [inf]  deleting '/nix/store/grixvx878884hy8x3xs0c0s1i00j632k-nghttp2-1.64.0'

2025-12-21T11:55:27.38653953Z [inf]  deleting '/nix/store/kryrg7ds05iwcmy81amavk8w13y4lxbs-gmp-6.3.0'

2025-12-21T11:55:27.386837092Z [inf]  deleting '/nix/store/ivl2v8rgg7qh1jkj5pwpqycax3rc2hnl-bzip2-1.0.8'

2025-12-21T11:55:27.387135897Z [inf]  deleting '/nix/store/c4rj90r2m89rxs64hmm857mipwjhig5d-file-5.46'

2025-12-21T11:55:27.387646054Z [inf]  deleting '/nix/store/pc74azbkr19rkd5bjalq2xwx86cj3cga-linux-headers-6.12'

2025-12-21T11:55:27.400096993Z [inf]  deleting '/nix/store/1m67ipsk39xvhyqrxnzv2m2p48pil8kl-gnu-config-2024-01-01'

2025-12-21T11:55:27.400291899Z [inf]  deleting '/nix/store/srfxqk119fijwnprgsqvn68ys9kiw0bn-patchelf-0.15.0'

2025-12-21T11:55:27.400833661Z [inf]  deleting '/nix/store/1m82cbxhdbb85h3lykjpry4mnvyq5x0m-libraries'

2025-12-21T11:55:27.401037484Z [inf]  deleting '/nix/store/2wh1gqyzf5xsvxpdz2k0bxiz583wwq29-keyutils-1.6.3-lib'

2025-12-21T11:55:27.401291282Z [inf]  deleting '/nix/store/a3c47r5z1q2c4rz0kvq8hlilkhx2s718-gawk-5.3.1'

2025-12-21T11:55:27.403706566Z [inf]  deleting '/nix/store/agvks3qmzja0yj54szi3vja6vx3cwkkw-curl-8.11.0-man'

2025-12-21T11:55:27.403968626Z [inf]  deleting unused links...

2025-12-21T11:55:29.291532292Z [inf]  note: currently hard linking saves 2.88 MiB

2025-12-21T11:55:29.306406698Z [inf]  61 store paths deleted, 559.38 MiB freed

2025-12-21T11:55:29.410233806Z [inf]  [stage-0  4/10] RUN nix-env -if .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix && nix-collect-garbage -d
2025-12-21T11:55:29.412752214Z [inf]  [stage-0  5/10] COPY . /app/.
2025-12-21T11:55:29.593898511Z [inf]  [stage-0  5/10] COPY . /app/.
2025-12-21T11:55:29.595077266Z [inf]  [stage-0  6/10] RUN --mount=type=cache,id=s/d75351e2-85e1-4a2b-baa2-706efbbc16f8-/root/npm,target=/root/.npm npm ci
2025-12-21T11:55:29.818111851Z [inf]  npm warn config production Use `--omit=dev` instead.

2025-12-21T11:55:36.217132025Z [inf]  npm warn deprecated q@1.5.1: You or someone you depend on is using Q, the JavaScript Promise library that gave JavaScript developers strong feelings about promises. They can almost certainly migrate to the native JavaScript promise now. Thank you literally everyone for joining me in this bet against the odds. Be excellent to each other.
npm warn deprecated
npm warn deprecated (For a CapTP with native promises, see @endo/eventual-send and @endo/captp)

2025-12-21T11:55:37.0466641Z [inf]  npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.

2025-12-21T11:55:39.204035301Z [inf]  npm warn deprecated @esbuild-kit/esm-loader@2.6.5: Merged into tsx: https://tsx.is

2025-12-21T11:55:39.253498433Z [inf]  npm warn deprecated @esbuild-kit/core-utils@3.3.2: Merged into tsx: https://tsx.is

2025-12-21T11:55:39.657144055Z [inf]  npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported

2025-12-21T11:55:52.560559009Z [inf]  
added 1052 packages, and audited 1053 packages in 23s

292 packages are looking for funding

2025-12-21T11:55:52.560669924Z [inf]    run `npm fund` for details

2025-12-21T11:55:52.583286446Z [inf]  
4 moderate severity vulnerabilities

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.

2025-12-21T11:55:52.972553203Z [inf]  [stage-0  6/10] RUN --mount=type=cache,id=s/d75351e2-85e1-4a2b-baa2-706efbbc16f8-/root/npm,target=/root/.npm npm ci
2025-12-21T11:55:52.973879437Z [inf]  [stage-0  7/10] COPY . /app/.
2025-12-21T11:55:53.374190201Z [inf]  [stage-0  7/10] COPY . /app/.
2025-12-21T11:55:53.375528179Z [inf]  [stage-0  8/10] RUN --mount=type=cache,id=s/d75351e2-85e1-4a2b-baa2-706efbbc16f8-next/cache,target=/app/.next/cache --mount=type=cache,id=s/d75351e2-85e1-4a2b-baa2-706efbbc16f8-node_modules/cache,target=/app/node_modules/.cache npm run build
2025-12-21T11:55:53.579092668Z [inf]  npm warn config production Use `--omit=dev` instead.

2025-12-21T11:55:53.598199278Z [inf]  
> manager@0.1.0 build
> next build


2025-12-21T11:55:54.566578443Z [inf]  Attention: Next.js now collects completely anonymous telemetry regarding usage.

2025-12-21T11:55:54.5668593Z [inf]  This information is used to shape Next.js' roadmap and prioritize features.
You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:

2025-12-21T11:55:54.566878876Z [inf]  https://nextjs.org/telemetry

2025-12-21T11:55:54.566949346Z [inf]  

2025-12-21T11:55:54.584690324Z [inf]  ▲ Next.js 16.1.0 (Turbopack)
- Environments: .env

2025-12-21T11:55:54.58482839Z [inf]  

2025-12-21T11:55:54.588248117Z [inf]  ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy

2025-12-21T11:55:54.681378561Z [inf]    Creating an optimized production build ...

2025-12-21T11:56:07.438367621Z [inf]  ✓ Compiled successfully in 12.1s

2025-12-21T11:56:07.449384613Z [inf]    Running TypeScript ...

2025-12-21T11:56:23.153449641Z [inf]    Collecting page data using 47 workers ...

2025-12-21T11:56:26.590529085Z [inf]    Generating static pages using 47 workers (0/20) ...

2025-12-21T11:56:26.765238867Z [inf]  ⚠ metadataBase property in metadata export is not set for resolving social open graph or twitter images, using "http://localhost:3000". See https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadatabase

2025-12-21T11:56:26.930587143Z [inf]    Generating static pages using 47 workers (5/20) 

2025-12-21T11:56:26.942586528Z [inf]    Generating static pages using 47 workers (10/20) 

2025-12-21T11:56:26.994534224Z [inf]    Generating static pages using 47 workers (15/20) 

2025-12-21T11:56:27.054647927Z [inf]  Authorization error: Error: Dynamic server usage: Route /setup couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
    at m (.next/server/chunks/ssr/_898d38cd._.js:1:18712)
    at <unknown> (.next/server/chunks/ssr/_898d38cd._.js:415:57771)
    at g (.next/server/chunks/ssr/[root-of-the-server]__79871ff6._.js:2:424)
    at h (.next/server/chunks/ssr/[root-of-the-server]__79871ff6._.js:2:1227)
    at i (.next/server/chunks/ssr/[root-of-the-server]__79871ff6._.js:2:1405)
    at i (.next/server/chunks/ssr/_70a9f130._.js:1:835)
    at f (.next/server/chunks/ssr/[root-of-the-server]__097a6195._.js:1:1477) {
  description: "Route /setup couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
  digest: 'DYNAMIC_SERVER_USAGE'
}

2025-12-21T11:56:27.088848402Z [inf]  ✓ Generating static pages using 47 workers (20/20) in 498.3ms

2025-12-21T11:56:27.095693376Z [inf]    Finalizing page optimization ...

2025-12-21T11:56:27.451872373Z [inf]  

2025-12-21T11:56:27.455519743Z [inf]  Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /admin
├ ƒ /admin/tenants
├ ƒ /api/auth/[...nextauth]
├ ƒ /api/calendar
├ ƒ /api/calendar/ical
├ ƒ /api/leaves/balance
├ ƒ /api/leaves/overlap
├ ƒ /api/seed
├ ƒ /api/team/workload
├ ƒ /api/v1/leaves
├ ƒ /api/v1/tasks
├ ƒ /api/v1/users
├ ƒ /app
├ ƒ /app/activity
├ ƒ /app/analytics
├ ƒ /app/announcements
├ ƒ /app/announcements/new
├ ƒ /app/approvals
├ ƒ /app/assets
├ ƒ /app/blog-admin
├ ƒ /app/calendar
├ ƒ /app/expenses
├ ƒ /app/inbox
├ ƒ /app/knowledge
├ ƒ /app/knowledge/[id]
├ ƒ /app/knowledge/new
├ ƒ /app/leaves
├ ƒ /app/meetings
├ ƒ /app/notifications
├ ƒ /app/offboarding
├ ƒ /app/offboarding/start
├ ƒ /app/onboarding
├ ƒ /app/operations
├ ƒ /app/operations/analytics
├ ƒ /app/operations/assets
├ ƒ /app/operations/payroll
├ ƒ /app/operations/requests
├ ƒ /app/operations/rooms
├ ƒ /app/payroll
├ ƒ /app/payroll/[id]
├ ƒ /app/people
├ ƒ /app/people/manage
├ ƒ /app/people/offboarding
├ ƒ /app/people/onboarding
├ ƒ /app/people/org-chart
├ ƒ /app/projects
├ ƒ /app/projects/[id]/edit
├ ƒ /app/projects/new
├ ƒ /app/reports
├ ƒ /app/requests
├ ƒ /app/rooms
├ ƒ /app/rooms/book
├ ƒ /app/rooms/new
├ ƒ /app/settings
├ ƒ /app/settings/approvals
├ ƒ /app/settings/billing
├ ƒ /app/settings/departments
├ ƒ /app/settings/expense-categories
├ ƒ /app/settings/holidays
├ ƒ /app/settings/integrations
├ ƒ /app/settings/leave-policies
├ ƒ /app/settings/modules
├ ƒ /app/settings/offboarding
├ ƒ /app/settings/offboarding/new
├ ƒ /app/tasks
├ ƒ /app/tasks/[id]
├ ƒ /app/tasks/recurring
├ ƒ /app/team
├ ƒ /app/team/[id]
├ ƒ /app/team/dashboard
├ ƒ /app/team/org-chart
├ ƒ /app/workspace
├ ƒ /app/workspace/activity
├ ƒ /app/workspace/announcements
├ ƒ /app/workspace/docs
├ ƒ /app/workspace/projects
├ ƒ /blog
├ ● /blog/[slug]
├ ○ /home
├ ƒ /invite
├ ○ /login
├ ○ /privacy
├ ○ /register
├ ƒ /setup
└ ○ /terms


ƒ Proxy (Middleware)


2025-12-21T11:56:27.455674324Z [inf]  ○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand


2025-12-21T11:56:27.727970178Z [inf]  [stage-0  8/10] RUN --mount=type=cache,id=s/d75351e2-85e1-4a2b-baa2-706efbbc16f8-next/cache,target=/app/.next/cache --mount=type=cache,id=s/d75351e2-85e1-4a2b-baa2-706efbbc16f8-node_modules/cache,target=/app/node_modules/.cache npm run build
2025-12-21T11:56:27.729616444Z [inf]  [stage-0  9/10] RUN printf '\nPATH=/app/node_modules/.bin:$PATH' >> /root/.profile
2025-12-21T11:56:27.846645085Z [inf]  [stage-0  9/10] RUN printf '\nPATH=/app/node_modules/.bin:$PATH' >> /root/.profile
2025-12-21T11:56:27.847769977Z [inf]  [stage-0 10/10] COPY . /app
2025-12-21T11:56:27.959504456Z [inf]  [stage-0 10/10] COPY . /app
2025-12-21T11:56:27.961556416Z [inf]  exporting to docker image format
2025-12-21T11:56:27.961578566Z [inf]  exporting to image
2025-12-21T11:56:44.140349610Z [inf]  [auth] sharing credentials for production-us-west2.railway-registry.com
2025-12-21T11:56:44.140406576Z [inf]  [auth] sharing credentials for production-us-west2.railway-registry.com
2025-12-21T11:56:47.699083639Z [inf]  importing to docker
2025-12-21T11:57:10.872851117Z [inf]  importing to docker
2025-12-21T11:57:10.965708382Z [inf]  === Successfully Built! ===
2025-12-21T11:57:10.965761305Z [inf]  Run:
2025-12-21T11:57:10.965768651Z [inf]  docker run -it production-us-west2.railway-registry.com/d75351e2-85e1-4a2b-baa2-706efbbc16f8:a797394a-89d7-416a-8471-6939242bbb6f
2025-12-21T11:57:10.993172905Z [inf]  [92mBuild time: 146.55 seconds[0m
2025-12-21T11:57:29.578398314Z [inf]  
2025-12-21T11:57:29.578468554Z [inf]  [35m====================
Starting Healthcheck
====================
[0m
2025-12-21T11:57:29.578471621Z [inf]  [37mPath: /[0m
2025-12-21T11:57:29.578472808Z [inf]  [37mRetry window: 5m0s[0m
2025-12-21T11:57:29.578473914Z [inf]  
2025-12-21T11:57:29.695761772Z [inf]  [93mAttempt #1 failed with service unavailable. Continuing to retry for 4m59s[0m
2025-12-21T11:57:40.736203535Z [inf]  [93mAttempt #2 failed with service unavailable. Continuing to retry for 4m48s[0m
2025-12-21T11:57:52.772645599Z [inf]  [93mAttempt #3 failed with service unavailable. Continuing to retry for 4m36s[0m
2025-12-21T11:57:56.805399984Z [inf]  [93mAttempt #4 failed with service unavailable. Continuing to retry for 4m32s[0m
2025-12-21T11:58:04.837982411Z [inf]  [93mAttempt #5 failed with service unavailable. Continuing to retry for 4m24s[0m
2025-12-21T11:58:20.877967714Z [inf]  [93mAttempt #6 failed with service unavailable. Continuing to retry for 4m8s[0m
2025-12-21T11:58:50.915170552Z [inf]  [93mAttempt #7 failed with service unavailable. Continuing to retry for 3m38s[0m
2025-12-21T11:59:20.948495921Z [inf]  [93mAttempt #8 failed with service unavailable. Continuing to retry for 3m8s[0m
2025-12-21T11:59:51.001166635Z [inf]  [93mAttempt #9 failed with service unavailable. Continuing to retry for 2m38s[0m
2025-12-21T12:00:21.203759069Z [inf]  [93mAttempt #10 failed with service unavailable. Continuing to retry for 2m8s[0m
2025-12-21T12:00:51.472098657Z [inf]  [93mAttempt #11 failed with service unavailable. Continuing to retry for 1m38s[0m
2025-12-21T12:01:21.503911420Z [inf]  [93mAttempt #12 failed with service unavailable. Continuing to retry for 1m8s[0m
2025-12-21T12:01:51.537008435Z [inf]  [93mAttempt #13 failed with service unavailable. Continuing to retry for 38s[0m
2025-12-21T12:02:21.577557156Z [inf]  [93mAttempt #14 failed with service unavailable. Continuing to retry for 8s[0m
2025-12-21T12:02:21.657674284Z [inf]  
2025-12-21T12:02:21.657739741Z [inf]  [91m1/1 replicas never became healthy![0m
2025-12-21T12:02:21.657741656Z [inf]  [91mHealthcheck failed![0m