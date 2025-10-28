# 10月25日正常版本

标记时间：2025-10-25

本次变更摘要：
- 三点等待提示移至 footer 上方，浅灰色显示，仅在 API 请求进行中显示，回复到达后立即隐藏。
- 移除患者气泡内的加载占位与相关逻辑（删除 `loading` 字段与 `resolvePatientLoading`）。
- 恢复并使用 `showReplyToast` 状态，在 `handleSend` 中控制等待提示的显示与隐藏。
- 智能提示点击后也显示等待三点：`handleSmartPromptAction` 直接调用 `handleSend(promptText)`，不再抑制等待。
- 修复返回按钮行为：从 `nav(-1)` 改为 `nav('/')`，点击返回可直接回到首页。

涉及文件：
- `src/pages/ConsultationChat.tsx`

验证方式：
- 预览地址 `http://localhost:5174/Bingli-project/consultation/case-a`，在发送消息与点击“智能提示”选项时，footer 上方显示浅灰三点等待，回复到达后三点消失；返回按钮点击回首页。

回退建议：
- 若使用 Git，建议创建标签：`normal-2025-10-25` 对应当前工作区内容，便于将来回滚。
- 未使用 Git 时，可以本文件为标记，参照“涉及文件”与“变更摘要”手动还原。