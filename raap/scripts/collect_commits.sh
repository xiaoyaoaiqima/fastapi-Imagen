#!/bin/bash
# 收集多个独立仓库最近的 commit message
# 用法: ./collect_commits.sh [time] [author] [output_file]
# 示例: ./collect_commits.sh 15h              # 所有人最近15小时
#       ./collect_commits.sh 3d buka          # buka 最近3天
#       ./collect_commits.sh 24h buka out.txt # 指定输出文件

TIME_INPUT=${1:-15h}
AUTHOR=${2:-""}
# 使用绝对路径避免 cd 后路径问题
OUTPUT_FILE="${3:-"commits_$(date +%Y%m%d_%H%M%S).txt"}"
if [[ "$OUTPUT_FILE" != /* ]]; then
    OUTPUT_FILE="$(pwd)/$OUTPUT_FILE"
fi
BASE_DIR="/Users/luxifa/raap"

# 解析时间参数（支持 15h, 3d 格式）
parse_time() {
    local input="$1"
    if [[ "$input" =~ ^([0-9]+)([hd])$ ]]; then
        local num="${BASH_REMATCH[1]}"
        local unit="${BASH_REMATCH[2]}"
        if [ "$unit" = "h" ]; then
            echo "${num} hours ago"
        elif [ "$unit" = "d" ]; then
            echo "${num} days ago"
        fi
    elif [[ "$input" =~ ^[0-9]+$ ]]; then
        # 兼容旧格式：纯数字默认为小时
        echo "${input} hours ago"
    else
        echo "15 hours ago"  # 默认值
    fi
}

# 获取时间范围描述（用于显示）
get_time_desc() {
    local input="$1"
    if [[ "$input" =~ ^([0-9]+)([hd])$ ]]; then
        local num="${BASH_REMATCH[1]}"
        local unit="${BASH_REMATCH[2]}"
        if [ "$unit" = "h" ]; then
            echo "最近 ${num} 小时"
        elif [ "$unit" = "d" ]; then
            echo "最近 ${num} 天"
        fi
    elif [[ "$input" =~ ^[0-9]+$ ]]; then
        echo "最近 ${input} 小时"
    else
        echo "最近 15 小时"
    fi
}

GIT_SINCE=$(parse_time "$TIME_INPUT")
TIME_DESC=$(get_time_desc "$TIME_INPUT")

# 构建 author 过滤参数
if [ -n "$AUTHOR" ]; then
    AUTHOR_FILTER="--author=$AUTHOR"
    AUTHOR_DESC="作者: ${AUTHOR}"
else
    AUTHOR_FILTER=""
    AUTHOR_DESC="作者: 全部"
fi

# 要检查的目录列表（独立 Git 仓库）
DIRS=(
    "raap-service-keyword-corpus"
    "raap-service-orchestrator"
    "raap-service-ag"
    "raap-service-generation-experts"
    "raap-admin-frontend"
    "readme"
)

echo "========================================" > "$OUTPUT_FILE"
echo "Git Commit 汇总报告" >> "$OUTPUT_FILE"
echo "时间范围: ${TIME_DESC}" >> "$OUTPUT_FILE"
echo "${AUTHOR_DESC}" >> "$OUTPUT_FILE"
echo "生成时间: $(date '+%Y-%m-%d %H:%M:%S')" >> "$OUTPUT_FILE"
echo "========================================" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

total_commits=0

for dir in "${DIRS[@]}"; do
    full_path="${BASE_DIR}/${dir}"
    
    if [ -d "$full_path/.git" ]; then
        echo "----------------------------------------" >> "$OUTPUT_FILE"
        echo "📁 ${dir}" >> "$OUTPUT_FILE"
        echo "----------------------------------------" >> "$OUTPUT_FILE"
        
        cd "$full_path" || continue
        
        # 获取 commit 数量
        commit_count=$(git log --since="$GIT_SINCE" $AUTHOR_FILTER --oneline 2>/dev/null | wc -l | tr -d ' ')
        
        if [ "$commit_count" -gt 0 ]; then
            echo "共 ${commit_count} 个提交:" >> "$OUTPUT_FILE"
            echo "" >> "$OUTPUT_FILE"
            
            git log --since="$GIT_SINCE" $AUTHOR_FILTER \
                --pretty=format:"[%ad] %an%n%s%n%b" \
                --date=format:'%m-%d %H:%M' 2>/dev/null >> "$OUTPUT_FILE"
            
            echo "" >> "$OUTPUT_FILE"
            total_commits=$((total_commits + commit_count))
        else
            echo "（无新提交）" >> "$OUTPUT_FILE"
        fi
        
        echo "" >> "$OUTPUT_FILE"
    else
        echo "⚠️  ${dir}: 目录不存在或非 Git 仓库" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
    fi
done

echo "========================================" >> "$OUTPUT_FILE"
echo "总计: ${total_commits} 个提交" >> "$OUTPUT_FILE"
echo "========================================" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "----------------------------------------" >> "$OUTPUT_FILE"
echo "AI 总结指令" >> "$OUTPUT_FILE"
echo "----------------------------------------" >> "$OUTPUT_FILE"
cat >> "$OUTPUT_FILE" << 'EOF'

根据上面的commit记录给我生成一个github风格的，没有emoji的，格式都用 1、这种的release note。区分服务。

服务分类说明：
- raap-service-ag、raap-service-generation-experts → 生成和对齐治理中心服务
- raap-service-orchestrator → 工作流编排调度中心
- raap-admin-frontend → 前端
- raap-service-keyword-corpus → 关键词和语料系统

输出格式示例：
## 关键词和语料系统
1、xxx

## 生成和对齐治理中心服务
1、xxx
2、xxx

## 工作流编排调度中心
1、xxx

## 前端
1、xxx

EOF

echo "✅ 已保存到: $OUTPUT_FILE"
echo ""
cat "$OUTPUT_FILE"
