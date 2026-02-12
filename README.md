# leonard.work

Static tool hub (Cloudflare Pages).

## Local Path

- Windows: `B:\\leonard.work`
- WSL: `/mnt/b/leonard.work`

## Git (SSH)

Remote:

- `origin`: `git@github.com:shuaige121/leonard.work.git`

Clone:

```bash
git clone git@github.com:shuaige121/leonard.work.git /mnt/b/leonard.work
```

If you use multiple SSH keys, configure `~/.ssh/config`:

```sshconfig
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519
  IdentitiesOnly yes
```

Test:

```bash
ssh -T git@github.com
```

## Deploy (Cloudflare Pages)

- Framework preset: None
- Build command: (empty)
- Output directory: `.`

## Pages

- `/index.html`: Entry
- `/sg.html`: Singapore tools directory
- `/pdf.html`: PDF toolbox (client-side: `pdf-lib` + `JSZip`)
- `/maid-salary.html`: Maid salary calculator (A4 print, includes WP number)
- `/terminal.html`: Terminal bootstrap commands
- `/vault/maple.html`: Maple Education contract/invoice generator (internal, `noindex`)
- `/School_Matchboard.html`: Legacy matchboard (internal, `noindex`)

## Theme

- Toggle: Auto/Light/Dark
- Storage: `localStorage["leonard_theme_v1"]`
- Auto mode follows `prefers-color-scheme`.

## Notes

- PDF processing is local-only (files are not uploaded by this site).
- `robots.txt` reduces crawling, but it is not security.
- `.gitignore` is allowlist-based: when you add a new file/page, you must also add a `!path` rule to commit it.
