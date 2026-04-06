#!/bin/bash
set -e

# ============================================================
# Leonard's Dev Environment — One-Click Setup
# Supports: wsl, ubuntu, mac
# Usage: bash setup.sh [wsl|ubuntu|mac]
# ============================================================

PLATFORM="${1:-auto}"
SETUP_DIR="$(cd "$(dirname "$0")" && pwd)"

# --- Detect platform ---
if [ "$PLATFORM" = "auto" ]; then
    if grep -qi microsoft /proc/version 2>/dev/null; then
        PLATFORM="wsl"
    elif [ "$(uname)" = "Darwin" ]; then
        PLATFORM="mac"
    else
        PLATFORM="ubuntu"
    fi
fi

echo "========================================="
echo "  Setup for: $PLATFORM"
echo "========================================="

# --- Colors ---
G='\033[0;32m'; Y='\033[1;33m'; R='\033[0;31m'; NC='\033[0m'
ok()   { echo -e "${G}[OK]${NC} $1"; }
warn() { echo -e "${Y}[SKIP]${NC} $1"; }
fail() { echo -e "${R}[FAIL]${NC} $1"; }

# --- Package manager ---
install_pkg() {
    if [ "$PLATFORM" = "mac" ]; then
        brew install "$@" 2>/dev/null || warn "brew install $* failed"
    else
        sudo apt-get install -y "$@" 2>/dev/null || warn "apt install $* failed"
    fi
}

# ============================================================
# 1. System packages
# ============================================================
echo -e "\n${Y}[1/8] System packages${NC}"

if [ "$PLATFORM" = "mac" ]; then
    command -v brew >/dev/null || /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    brew update
    brew install git curl wget rsync jq
else
    sudo apt-get update -q
    sudo apt-get install -y git curl wget rsync jq build-essential
fi
ok "System packages"

# ============================================================
# 2. Zsh + Oh My Zsh + plugins
# ============================================================
echo -e "\n${Y}[2/8] Zsh + Oh My Zsh${NC}"

if [ "$PLATFORM" = "mac" ]; then
    brew install zsh
else
    install_pkg zsh
fi

# Oh My Zsh
if [ ! -d "$HOME/.oh-my-zsh" ]; then
    RUNZSH=no sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
    ok "Oh My Zsh installed"
else
    warn "Oh My Zsh exists"
fi

# Plugins
ZSH_CUSTOM="${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}"
[ ! -d "$ZSH_CUSTOM/plugins/zsh-autosuggestions" ] && \
    git clone https://github.com/zsh-users/zsh-autosuggestions "$ZSH_CUSTOM/plugins/zsh-autosuggestions"
[ ! -d "$ZSH_CUSTOM/plugins/zsh-syntax-highlighting" ] && \
    git clone https://github.com/zsh-users/zsh-syntax-highlighting "$ZSH_CUSTOM/plugins/zsh-syntax-highlighting"
[ ! -d "$ZSH_CUSTOM/plugins/zsh-completions" ] && \
    git clone https://github.com/zsh-users/zsh-completions "$ZSH_CUSTOM/plugins/zsh-completions"
ok "Zsh plugins"

# ============================================================
# 3. CLI tools (eza, starship, zoxide, gh)
# ============================================================
echo -e "\n${Y}[3/8] CLI tools${NC}"

if [ "$PLATFORM" = "mac" ]; then
    brew install eza starship zoxide gh
else
    # eza
    if ! command -v eza >/dev/null; then
        cargo install eza 2>/dev/null || install_pkg eza || warn "eza: install manually"
    fi
    # starship
    if ! command -v starship >/dev/null; then
        curl -sS https://starship.rs/install.sh | sh -s -- -y
    fi
    # zoxide
    if ! command -v zoxide >/dev/null; then
        curl -sSfL https://raw.githubusercontent.com/ajeetdsouza/zoxide/main/install.sh | sh
    fi
    # gh
    if ! command -v gh >/dev/null; then
        (type -p wget >/dev/null || sudo apt-get install wget -y) && \
        sudo mkdir -p -m 755 /etc/apt/keyrings && \
        out=$(mktemp) && wget -nv -O$out https://cli.github.com/packages/githubcli-archive-keyring.gpg && \
        cat $out | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null && \
        sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg && \
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null && \
        sudo apt-get update -q && sudo apt-get install gh -y
    fi
fi
ok "CLI tools"

# ============================================================
# 4. SDKs (NVM/Node, Python, Rust, uv)
# ============================================================
echo -e "\n${Y}[4/8] SDKs${NC}"

# NVM + Node
if [ ! -d "$HOME/.nvm" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
fi
command -v nvm >/dev/null 2>&1 && nvm install --lts && ok "Node $(node -v)" || warn "NVM: source shell first"

# Rust
if ! command -v rustup >/dev/null; then
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
fi
ok "Rust $(rustc --version 2>/dev/null || echo 'pending')"

# uv (Python package manager)
if ! command -v uv >/dev/null; then
    curl -LsSf https://astral.sh/uv/install.sh | sh
fi
ok "uv"

# ruff
if ! command -v ruff >/dev/null; then
    pip3 install ruff 2>/dev/null || pipx install ruff 2>/dev/null || warn "ruff: install manually"
fi

ok "SDKs"

# ============================================================
# 5. AI Tools (Claude Code, Codex CLI, Gemini CLI)
# ============================================================
echo -e "\n${Y}[5/8] AI tools${NC}"

# Claude Code
if ! command -v claude >/dev/null; then
    npm install -g @anthropic-ai/claude-code && ok "Claude Code installed"
else
    ok "Claude Code $(claude --version 2>/dev/null)"
fi

# Codex CLI
if ! command -v codex >/dev/null; then
    npm install -g @openai/codex && ok "Codex CLI installed"
else
    ok "Codex CLI $(codex --version 2>/dev/null)"
fi

# Gemini CLI
if ! command -v gemini >/dev/null; then
    npm install -g @anthropic-ai/gemini-cli 2>/dev/null || npm install -g @anthropic-ai/gemini 2>/dev/null || npm install -g gemini-cli 2>/dev/null || warn "Gemini: install manually"
else
    ok "Gemini CLI"
fi

ok "AI tools"

# ============================================================
# 6. Shell configs (.zshrc, starship, gitconfig)
# ============================================================
echo -e "\n${Y}[6/8] Shell configs${NC}"

# .zshrc — platform-adaptive
cat > "$HOME/.zshrc" << 'ZSHRC'
export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME=""  # starship handles prompt

# Performance
ZSH_AUTOSUGGEST_USE_ASYNC=1
ZSH_AUTOSUGGEST_MANUAL_REBIND=1
ZSH_AUTOSUGGEST_BUFFER_MAX_SIZE=20
ZSH_HIGHLIGHT_MAXLENGTH=200

plugins=(
  git
  zsh-autosuggestions
  zsh-syntax-highlighting
  zsh-completions
  sudo
  history
)

source $ZSH/oh-my-zsh.sh
stty -ixon 2>/dev/null

# PATH
export PATH="$HOME/.local/bin:$HOME/.cargo/bin:$PATH"
ZSHRC

# Platform-specific PATH additions
if [ "$PLATFORM" = "wsl" ]; then
    cat >> "$HOME/.zshrc" << 'WSL_PATH'

# WSL: selective Windows paths
export PATH="$PATH:/mnt/c/WINDOWS/system32:/mnt/c/WINDOWS"
export PATH="$PATH:/mnt/c/Users/LEONARD/AppData/Local/Programs/Microsoft VS Code/bin"
export PATH="$PATH:/mnt/c/Program Files/Docker/Docker/resources/bin"

# CUDA 12.8
export PATH="/usr/local/cuda-12.8/bin:/usr/local/cuda/bin:$PATH"
export LD_LIBRARY_PATH="/usr/local/cuda-12.8/lib64:/usr/local/cuda/lib64:${LD_LIBRARY_PATH:-}"
WSL_PATH
elif [ "$PLATFORM" = "ubuntu" ]; then
    cat >> "$HOME/.zshrc" << 'UBUNTU_PATH'

# CUDA (if installed)
[ -d /usr/local/cuda/bin ] && export PATH="/usr/local/cuda/bin:$PATH"
[ -d /usr/local/cuda/lib64 ] && export LD_LIBRARY_PATH="/usr/local/cuda/lib64:${LD_LIBRARY_PATH:-}"
UBUNTU_PATH
fi

# Common tail for all platforms
cat >> "$HOME/.zshrc" << 'ZSHRC_TAIL'

# NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"

# Aliases
alias cl="claude --dangerously-skip-permissions"
alias co="codex --dangerously-bypass-approvals-and-sandbox"
alias gm="gemini"
alias ll="eza -la --icons --git 2>/dev/null || ls -la"
alias lt="eza --tree --level=2 --icons 2>/dev/null || tree -L 2"
alias gs="git status"
alias gp="git pull"
alias gd="git diff"
alias gl="git log --oneline --graph --decorate -20"

# Starship
eval "$(starship init zsh)"

# Zoxide
eval "$(zoxide init zsh)"

# WezTerm shell integration
[ -f "$HOME/.config/wezterm/wezterm-shell.sh" ] && source "$HOME/.config/wezterm/wezterm-shell.sh"
ZSHRC_TAIL
ok ".zshrc"

# starship.toml
mkdir -p "$HOME/.config"
cat > "$HOME/.config/starship.toml" << 'STARSHIP'
command_timeout = 500

[character]
success_symbol = "[>](bold green)"
error_symbol = "[x](bold red)"

[directory]
truncation_length = 5
style = "bold cyan"

[git_branch]
symbol = "git "
style = "bold purple"

[git_status]
style = "bold red"

[python]
symbol = "py "

[nodejs]
symbol = "node "

[rust]
symbol = "rs "

[docker_context]
symbol = "docker "
STARSHIP
ok "starship.toml"

# .gitconfig
echo "  Configure git manually:"
echo "    git config --global user.name \"YOUR_NAME\""
echo "    git config --global user.email \"YOUR_EMAIL\""
git config --global core.excludesfile "$HOME/.gitignore_global"
ok ".gitconfig (excludesfile only)"

# .gitignore_global
cat > "$HOME/.gitignore_global" << 'GITIGNORE'
.DS_Store
*.swp
*.swo
*~
.env
.env.local
.vscode/settings.json
__pycache__/
*.pyc
node_modules/
.idea/
*.log
GITIGNORE
ok ".gitignore_global"

# SSH key (if missing)
mkdir -p "$HOME/.ssh" && chmod 700 "$HOME/.ssh"
if [ ! -f "$HOME/.ssh/id_ed25519" ]; then
    ssh-keygen -t ed25519 -f "$HOME/.ssh/id_ed25519" -N ""
    ok "SSH key generated — add to GitHub: cat ~/.ssh/id_ed25519.pub"
else
    warn "SSH key exists"
fi
echo "  Tip: SSH config (hosts, IPs) should be configured manually"

# ============================================================
# 7. Claude Code + Codex configs
# ============================================================
echo -e "\n${Y}[7/8] Claude Code + Codex configs${NC}"

mkdir -p "$HOME/.claude"

# CLAUDE.md — platform-adaptive
if [ "$PLATFORM" = "wsl" ]; then
    cp "$SETUP_DIR/CLAUDE.md" "$HOME/.claude/CLAUDE.md"
else
    # Strip WSL-specific lines for non-WSL
    sed '/WSL2 on Windows/d; /Windows 工具路径/d; /PowerShell/d; /mnt\/c/d; /mnt\/d/d' \
        "$SETUP_DIR/CLAUDE.md" > "$HOME/.claude/CLAUDE.md"
fi
ok "CLAUDE.md"

# settings.json
cp "$SETUP_DIR/claude-settings.json" "$HOME/.claude/settings.json"
ok "Claude settings.json"

# Hub skills
if [ -f "$SETUP_DIR/hub-skills.tar.gz" ]; then
    mkdir -p "$HOME/.claude/skills"
    tar xzf "$SETUP_DIR/hub-skills.tar.gz" -C "$HOME/.claude/skills/"
    ok "Hub skills ($(find "$HOME/.claude/skills/hub" -name "SKILL.md" | wc -l) sub-skills)"
fi

# Commands (only the essentials)
if [ -f "$SETUP_DIR/commands.tar.gz" ]; then
    mkdir -p "$HOME/.claude/commands"
    tar xzf "$SETUP_DIR/commands.tar.gz" -C "$HOME/.claude/commands/"
    ok "Commands ($(ls "$HOME/.claude/commands/"*.md 2>/dev/null | wc -l) files)"
fi

# Roles
if [ -f "$SETUP_DIR/roles.tar.gz" ]; then
    tar xzf "$SETUP_DIR/roles.tar.gz" -C "$HOME/.claude/"
    ok "Skill roles"
fi

# Empty memory
mkdir -p "$HOME/.claude/projects/-home-leonard/memory"
echo "" > "$HOME/.claude/projects/-home-leonard/memory/MEMORY.md"
ok "Memory (clean)"

# Codex config
mkdir -p "$HOME/.codex"
if [ ! -f "$HOME/.codex/config.toml" ]; then
    cat > "$HOME/.codex/config.toml" << 'CODEX'
model = "gpt-5.4"
model_reasoning_effort = "xhigh"
personality = "pragmatic"
CODEX
    ok "Codex config"
else
    warn "Codex config exists"
fi

# ============================================================
# 8. GUI Apps & Desktop Tools
# ============================================================
echo -e "\n${Y}[8/9] GUI apps & desktop tools${NC}"

if [ "$PLATFORM" = "mac" ]; then
    # --- macOS: brew cask ---
    CASK_APPS=(
        google-chrome
        wechat
        whatsapp
        claude
        visual-studio-code
        wezterm
        docker
        telegram
        discord
        raycast
        alt-tab           # Windows-style alt-tab
        stats             # System monitor in menu bar
        iina              # Video player
        the-unarchiver
        obsidian
    )
    for app in "${CASK_APPS[@]}"; do
        if ! brew list --cask "$app" &>/dev/null; then
            brew install --cask "$app" && ok "Installed: $app"
        else
            warn "$app exists"
        fi
    done

elif [ "$PLATFORM" = "ubuntu" ]; then
    # --- Ubuntu: apt + snap + deb ---

    # Chrome
    if ! command -v google-chrome >/dev/null; then
        wget -q -O /tmp/chrome.deb "https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb"
        sudo dpkg -i /tmp/chrome.deb 2>/dev/null || sudo apt-get install -f -y
        rm -f /tmp/chrome.deb
        ok "Chrome"
    else
        warn "Chrome exists"
    fi

    # VS Code
    if ! command -v code >/dev/null; then
        wget -q -O /tmp/code.deb "https://code.visualstudio.com/sha/download?build=stable&os=linux-deb-x64"
        sudo dpkg -i /tmp/code.deb 2>/dev/null || sudo apt-get install -f -y
        rm -f /tmp/code.deb
        ok "VS Code"
    else
        warn "VS Code exists"
    fi

    # Snap apps
    SNAP_APPS=(telegram-desktop discord obsidian)
    for app in "${SNAP_APPS[@]}"; do
        if ! snap list "$app" &>/dev/null; then
            sudo snap install "$app" 2>/dev/null && ok "Snap: $app" || warn "Snap $app failed"
        else
            warn "$app exists"
        fi
    done

    # WeChat (flatpak — best option on Linux)
    if command -v flatpak >/dev/null; then
        flatpak install -y flathub com.tencent.WeChat 2>/dev/null && ok "WeChat (flatpak)" || warn "WeChat: install manually"
    else
        echo "  Tip: install flatpak first for WeChat: sudo apt install flatpak"
    fi

    # WhatsApp (web-based or electron)
    echo "  Tip: WhatsApp on Linux — use Chrome PWA or: snap install whatsapp-for-linux"

    # Claude Desktop
    if ! command -v claude-desktop >/dev/null; then
        echo "  Tip: Claude Desktop — download from https://claude.ai/download"
    fi

    # Docker
    if ! command -v docker >/dev/null; then
        curl -fsSL https://get.docker.com | sh
        sudo usermod -aG docker $USER
        ok "Docker"
    else
        warn "Docker exists"
    fi

elif [ "$PLATFORM" = "wsl" ]; then
    # --- WSL: install on Windows side via winget ---
    PS="/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe"
    WINGET_APPS=(
        "Google.Chrome"
        "Tencent.WeChat"
        "WhatsApp.WhatsApp"
        "Anthropic.Claude"
        "Microsoft.VisualStudioCode"
        "wez.wezterm"
        "Docker.DockerDesktop"
        "Telegram.TelegramDesktop"
        "Discord.Discord"
        "Microsoft.PowerToys"
        "Obsidian.Obsidian"
    )
    for app in "${WINGET_APPS[@]}"; do
        $PS -NoProfile -Command "winget install --accept-package-agreements --accept-source-agreements -e --id $app" 2>/dev/null && ok "winget: $app" || warn "winget: $app (already installed or failed)"
    done
fi

ok "GUI apps"

# ============================================================
# 9. Platform-specific setup
# ============================================================
echo -e "\n${Y}[9/9] Platform-specific${NC}"

if [ "$PLATFORM" = "wsl" ]; then
    # wsl.conf
    if ! grep -q "systemd=true" /etc/wsl.conf 2>/dev/null; then
        sudo tee /etc/wsl.conf > /dev/null << 'WSLCONF'
[boot]
systemd=true

[user]
default=leonard

[interop]
appendWindowsPath = false
WSLCONF
        ok "wsl.conf (restart WSL to apply)"
    else
        warn "wsl.conf exists"
    fi

    # WezTerm shell integration
    mkdir -p "$HOME/.config/wezterm"
    cat > "$HOME/.config/wezterm/wezterm-shell.sh" << 'WEZTERM'
[ -f "$HOME/.local/share/wezterm/shell-integration.sh" ] && source "$HOME/.local/share/wezterm/shell-integration.sh"
WEZTERM
    ok "WezTerm integration"

elif [ "$PLATFORM" = "mac" ]; then
    # macOS-specific
    defaults write com.apple.finder AppleShowAllFiles YES 2>/dev/null
    ok "macOS: show hidden files"

elif [ "$PLATFORM" = "ubuntu" ]; then
    ok "Ubuntu native — no extra platform setup needed"
    if ! command -v docker >/dev/null; then
        echo "  Tip: install Docker if needed:  curl -fsSL https://get.docker.com | sh"
    fi
fi

# Set zsh as default shell
if [ "$SHELL" != "$(which zsh)" ]; then
    chsh -s "$(which zsh)" 2>/dev/null && ok "Default shell -> zsh" || warn "chsh failed, run manually"
fi

# ============================================================
# Done
# ============================================================
echo ""
echo "========================================="
echo -e "  ${G}Setup complete for: $PLATFORM${NC}"
echo "========================================="
echo ""
echo "Next steps:"
echo "  1. Restart your shell:  exec zsh"
echo "  2. Login to services:"
echo "     claude login"
echo "     codex login"
echo "     gh auth login"
echo "  3. Copy SSH key to servers:"
echo "     ssh-copy-id gpu13"
echo "     ssh-copy-id nas"
echo ""
