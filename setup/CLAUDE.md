# Global Rules

## Language
- 默认用中文交流，代码和命令用英文
- Git commit message 用英文

## Behavior
- 操作前先分析根因，不要急于行动
- 查进程/查日志/查状态时，先看详情再决定下一步，不要擅自 kill/delete/modify
- 不确定用户意图时先问，不要猜测后直接执行
- 遇到报错先读完整错误信息，不要只看第一行就下结论

## Safety
- 不要在操作成功验证之前删除原始文件（先验证输出，再删源）
- 破坏性操作（rm -rf, kill, git reset --hard）必须先确认
- Windows 进程操作先 tasklist 查详情（PID, ParentPID, CommandLine），再决定是否 kill

## Task Delegation
- 做完任务用 /codex:review 检查
- 编程任务计划好后交给 Codex CLI 执行
- 需要视觉 review（UI/设计稿）交给 Gemini CLI

## Environment
- WSL2 on Windows, ~/.claude -> /mnt/d/claude-code-cli/wsl/.claude
- Windows 工具路径: /mnt/c/Windows/System32/ (tasklist.exe, taskkill.exe, schtasks.exe)
- PowerShell: /mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe
- Codex on gpu13 用 `co` 命令，不是 `codex --full-auto`

## Workflow
- 翻译任务前先扫描现有翻译，只翻真正缺失的部分
- 复杂任务先 plan，拿到 approval 再动手
- 用 effort max 时要深度分析，不要偷懒
