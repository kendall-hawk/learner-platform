#!/bin/bash

# 🚀 Vue.js项目快速搭建脚本
# 在GitHub Codespaces中一键创建完整项目结构

echo "🚀 开始创建Vue.js项目结构..."

# 创建所有目录
echo "📁 创建目录结构..."
mkdir -p .github/workflows \
         public \
         src/components/{common,auth,subscription,wordFreq,audio,glossary,search,navigation} \
         src/{views,stores,services,composables,utils,workers,types,layouts,router,config}

# 创建所有文件
echo "📄 创建文件..."
touch package.json \
      vite.config.ts \
      tsconfig.json \
      tailwind.config.js \
      index.html \
      dist-deploy.config.js \
      .github/workflows/deploy.yml \
      public/manifest.json \
      src/main.ts \
      src/App.vue \
      src/components/common/LoadingSpinner.vue \
      src/components/auth/{LoginForm.vue,SignupForm.vue} \
      src/components/subscription/{PricingCard.vue,SubscriptionModal.vue,FeatureGate.vue} \
      src/components/wordFreq/{FrequencyChart.vue,SearchPanel.vue,WordCloud.vue,WordDetails.vue} \
      src/components/audio/{AudioPlayer.vue,AudioSync.vue} \
      src/components/glossary/{GlossaryPopup.vue,WordDefinition.vue} \
      src/components/search/{ArticleSearch.vue,HighlightManager.vue} \
      src/components/navigation/{MainNavigation.vue,BreadcrumbNav.vue} \
      src/views/{HomePage.vue,LoginPage.vue,Dashboard.vue,WordFrequencyPage.vue,ArticlePage.vue} \
      src/stores/{auth.ts,subscription.ts,wordFrequency.ts} \
      src/services/{mockApi.ts,authService.ts,subscriptionService.ts,wordFrequencyService.ts,audioSyncService.ts,glossaryService.ts,searchService.ts,navigationService.ts} \
      src/composables/{useFeatureAccess.ts,useAudioSync.ts,useGlossary.ts,useSearch.ts} \
      src/utils/{featureGates.ts,stemmer.ts,textAnalyzer.ts,srtParser.ts,highlighter.ts} \
      src/workers/{frequencyAnalyzer.worker.ts,srtParser.worker.ts} \
      src/types/{index.ts,audio.ts} \
      src/layouts/MainLayout.vue \
      src/router/index.ts \
      src/config/api.ts

# 提交到Git
echo "📦 提交更改到Git..."
git add .
git commit -m "🎉 Create complete Vue.js project structure"

# 推送到远程仓库
echo "🚀 推送到远程仓库..."
git push

echo "✅ 项目结构创建完成！"
echo "📊 创建了以下内容："
echo "   - 20个目录"
echo "   - 60个文件"
echo "   - 已提交到Git并推送"

# 显示项目结构
echo ""
echo "🌳 项目结构预览："
tree -a -L 3 2>/dev/null || find . -type d -name ".git" -prune -o -type d -print | head -20