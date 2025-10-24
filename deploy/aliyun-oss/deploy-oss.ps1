param(
  [string]$Bucket = "bingli-h5-nick3419929572",
  [string]$Region = "oss-cn-hangzhou",
  [string]$OssutilPath = "C:\ossutil64\ossutil64.exe"
)

$ErrorActionPreference = "Stop"

function Ensure-FileExists($Path) {
  if (-Not (Test-Path $Path)) {
    throw "未找到文件: $Path，请确认 ossutil64.exe 已安装并路径正确。"
  }
}

function Run-Cmd($Cmd, $Args) {
  Write-Host "==> $Cmd $Args" -ForegroundColor Cyan
  & $Cmd $Args
}

# 校验 ossutil
Ensure-FileExists $OssutilPath

# 读取 AK/SK（建议从系统环境变量传入）
$AK = $env:ALIBABA_ACCESS_KEY_ID
$SK = $env:ALIBABA_ACCESS_KEY_SECRET
if (-Not $AK -or -Not $SK) {
  throw "未设置环境变量 ALIBABA_ACCESS_KEY_ID / ALIBABA_ACCESS_KEY_SECRET"
}

$Endpoint = "$Region.aliyuncs.com"
$OssUrl = "oss://$Bucket"
$PublicUrl = "https://$Bucket.$Region.aliyuncs.com/"

# 1) 构建生产包
Write-Host "==> 构建生产包 (npm run build)" -ForegroundColor Green
npm run build

# 2) 配置 ossutil（会话覆盖）
Run-Cmd $OssutilPath "config --endpoint $Endpoint --accessKeyID $AK --accessKeySecret $SK"

# 3) 创建 Bucket（如存在会报错，可忽略）
try {
  Run-Cmd $OssutilPath "mb $OssUrl --endpoint $Endpoint"
} catch {
  Write-Host "Bucket 已存在或创建失败（可忽略）：" $_.Exception.Message -ForegroundColor Yellow
}

# 4) 设置静态网站与公开读权限
Run-Cmd $OssutilPath "set-bucket-website $OssUrl --index index.html --error index.html --endpoint $Endpoint"
Run-Cmd $OssutilPath "set-acl $OssUrl public-read --endpoint $Endpoint"

# 5) 上传 dist
Run-Cmd $OssutilPath "cp -r dist $OssUrl/ --endpoint $Endpoint --force"

Write-Host "部署完成，可访问：$PublicUrl" -ForegroundColor Green