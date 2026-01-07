// ============================================
// 搜索页面逻辑
// ============================================

// 当前筛选条件
const currentFilters = {
    species: null,
    scene: null
};

// 防抖定时器
let searchTimeout = null;

// 处理搜索输入
function handleSearchInput(event) {
    // 回车键执行搜索
    if (event.key === 'Enter') {
        performSearch();
        return;
    }
    
    // 防抖获取建议
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        getSuggestions();
    }, 300);
}

// 执行搜索
async function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    const resultsContainer = document.getElementById('searchResults');
    
    // 隐藏建议
    document.getElementById('suggestions').style.display = 'none';
    
    // 显示加载状态
    resultsContainer.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>搜索中...</p>
        </div>
    `;
    
    try {
        // 调用搜索 API
        const result = await api.searchMoments(query, currentFilters);
        
        if (result.success && result.results.length > 0) {
            displaySearchResults(result.results, query);
        } else {
            resultsContainer.innerHTML = `
                <div class="search-placeholder">
                    <div class="placeholder-icon">😔</div>
                    <h3>没有找到结果</h3>
                    <p>试试其他关键词或调整筛选条件</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('搜索失败:', error);
        resultsContainer.innerHTML = `
            <div class="search-placeholder">
                <div class="placeholder-icon">⚠️</div>
                <h3>搜索失败</h3>
                <p>请检查网络连接或稍后重试</p>
                <button class="btn-primary" onclick="performSearch()">重试</button>
            </div>
        `;
    }
}

// 显示搜索结果
function displaySearchResults(results, query) {
    const container = document.getElementById('searchResults');
    
    const resultCount = results.length;
    const queryText = query ? `"${query}"` : '所有日记';
    
    container.innerHTML = `
        <div class="search-results-header">
            <h2>搜索结果</h2>
            <p class="result-count">找到 ${resultCount} 条关于 ${queryText} 的结果</p>
        </div>
        <div class="moments-grid">
            ${results.map(moment => createSearchResultCard(moment)).join('')}
        </div>
    `;
}

// 创建搜索结果卡片
function createSearchResultCard(moment) {
    const coverImage = moment.coverImage || 'https://via.placeholder.com/400x300?text=PetMoments';
    const tags = moment.tags || [];
    const aiScene = moment.aiScene || '';
    const aiDescription = moment.aiDescription || '';
    
    // 高亮显示搜索关键词（如果有 @search.highlights）
    const title = moment['@search.highlights']?.title?.[0] || moment.title;
    const description = moment['@search.highlights']?.description?.[0] || moment.description || '暂无描述';
    
    return `
        <div class="moment-card" onclick="viewMoment('${moment.id}', '${moment.userId || 'unknown'}')">
            <img 
                src="${coverImage}" 
                alt="${moment.title}"
                class="moment-card-image"
                onerror="this.src='https://via.placeholder.com/400x300?text=PetMoments'"
            >
            <div class="moment-card-content">
                <h3 class="moment-card-title">
                    <span class="paw-icon">🐾</span>
                    ${title}
                </h3>
                
                ${moment.petName ? `<p style="color: var(--azure-blue); font-weight: 600; margin-bottom: 8px;">🐕 ${moment.petName}</p>` : ''}
                
                <p class="moment-card-description">
                    ${description}
                </p>
                
                ${aiDescription ? `
                    <p style="background: var(--bg-gray); padding: 10px; border-radius: 8px; font-size: 0.9rem; margin: 10px 0;">
                        <strong>🤖 AI 识别:</strong> ${aiDescription}
                    </p>
                ` : ''}
                
                <div class="moment-card-tags">
                    ${tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
                    ${aiScene ? `<span class="tag ai-tag">🎬 ${aiScene}</span>` : ''}
                </div>
                
                <div class="moment-card-meta">
                    <div class="meta-item">
                        <span>${formatDate(moment.createdAt)}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 获取搜索建议
async function getSuggestions() {
    const query = document.getElementById('searchInput').value.trim();
    const suggestionsContainer = document.getElementById('suggestions');
    
    if (query.length < 2) {
        suggestionsContainer.style.display = 'none';
        return;
    }
    
    try {
        const suggestions = await api.getSuggestions(query);
        
        if (suggestions.length > 0) {
            suggestionsContainer.innerHTML = suggestions.map(item => `
                <div class="suggestion-item" onclick="selectSuggestion('${item['@search.text']}')">
                    <strong>${item['@search.text']}</strong>
                    ${item.tags ? `<div style="margin-top: 5px; font-size: 0.9rem; color: var(--text-gray);">${item.tags.slice(0, 3).join(', ')}</div>` : ''}
                </div>
            `).join('');
            suggestionsContainer.style.display = 'block';
        } else {
            suggestionsContainer.style.display = 'none';
        }
    } catch (error) {
        console.error('获取建议失败:', error);
        suggestionsContainer.style.display = 'none';
    }
}

// 选择建议
function selectSuggestion(text) {
    document.getElementById('searchInput').value = text;
    document.getElementById('suggestions').style.display = 'none';
    performSearch();
}

// 切换筛选器
function toggleFilter(button) {
    const filterType = button.getAttribute('data-filter');
    const filterValue = button.getAttribute('data-value');
    
    // 移除同类型其他按钮的 active 状态
    const sameTypeButtons = document.querySelectorAll(`[data-filter="${filterType}"]`);
    sameTypeButtons.forEach(btn => {
        if (btn !== button) {
            btn.classList.remove('active');
        }
    });
    
    // 切换当前按钮状态
    if (button.classList.contains('active')) {
        button.classList.remove('active');
        currentFilters[filterType] = null;
    } else {
        button.classList.add('active');
        currentFilters[filterType] = filterValue;
    }
    
    // 执行搜索
    performSearch();
}

// 清除所有筛选
function clearFilters() {
    currentFilters.species = null;
    currentFilters.scene = null;
    
    // 移除所有 active 状态
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 重新搜索
    performSearch();
}

// 查看日记详情
function viewMoment(momentId, userId) {
    window.location.href = `moment-detail.html?id=${momentId}&userId=${userId}`;
}

// 格式化日期
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return '今天';
    } else if (diffDays === 1) {
        return '昨天';
    } else if (diffDays < 7) {
        return `${diffDays}天前`;
    } else {
        return date.toLocaleDateString('zh-CN');
    }
}

// 点击页面其他地方隐藏建议
document.addEventListener('click', (event) => {
    const suggestionsContainer = document.getElementById('suggestions');
    const searchInput = document.getElementById('searchInput');
    
    if (event.target !== searchInput && !suggestionsContainer.contains(event.target)) {
        suggestionsContainer.style.display = 'none';
    }
});

