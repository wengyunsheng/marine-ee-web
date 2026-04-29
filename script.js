// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 顶部导航链接点击事件
    const headerNavLinks = document.querySelectorAll('.header-nav a');
    const modules = document.querySelectorAll('.module');

    headerNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            
            // 更新顶部导航链接状态
            headerNavLinks.forEach(navLink => navLink.classList.remove('active'));
            this.classList.add('active');
            
            // 更新模块显示状态
            modules.forEach(module => {
                module.classList.remove('active');
                if (module.id === targetId) {
                    module.classList.add('active');
                }
            });
        });
    });

    // 左侧导航链接点击事件
    const sidebarNavLinks = document.querySelectorAll('.sidebar .nav-link');
    sidebarNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            sidebarNavLinks.forEach(navLink => navLink.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // 统计卡片悬停效果
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
        });
    });

    // 按钮点击事件
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // 模拟按钮点击效果
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });

    // 表格行悬停效果
    const tableRows = document.querySelectorAll('.data-table tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f8f9fa';
        });
        row.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'white';
        });
    });

    // 分页按钮点击事件
    const paginationButtons = document.querySelectorAll('.pagination .btn-sm');
    paginationButtons.forEach(button => {
        button.addEventListener('click', function() {
            paginationButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // 图表控制按钮点击事件
    const chartControlButtons = document.querySelectorAll('.chart-controls .btn-sm');
    chartControlButtons.forEach(button => {
        button.addEventListener('click', function() {
            chartControlButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // 搜索框功能
    const searchBoxes = document.querySelectorAll('.search-box input');
    searchBoxes.forEach(searchBox => {
        searchBox.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                alert(`搜索：${this.value}`);
            }
        });
    });

    // 筛选选择事件
    const filterSelects = document.querySelectorAll('.filter-select');
    filterSelects.forEach(select => {
        select.addEventListener('change', function() {
            alert(`筛选：${this.options[this.selectedIndex].text}`);
        });
    });

    // 新建按钮点击事件
    const addButtons = document.querySelectorAll('.btn-primary');
    addButtons.forEach(button => {
        if (button.textContent.includes('新建')) {
            button.addEventListener('click', function() {
                alert(`点击了${this.textContent}按钮`);
            });
        }
    });

    // 导出按钮点击事件
    const exportButtons = document.querySelectorAll('.btn-secondary');
    exportButtons.forEach(button => {
        if (button.textContent.includes('导出')) {
            button.addEventListener('click', function() {
                alert(`导出报告`);
            });
        }
    });

    // 刷新按钮点击事件
    const refreshButtons = document.querySelectorAll('.btn-secondary');
    refreshButtons.forEach(button => {
        if (button.textContent.includes('刷新')) {
            button.addEventListener('click', function() {
                alert('刷新数据');
            });
        }
    });

    // 开始评估按钮点击事件
    const startEvalButton = document.querySelector('.process-action .btn-primary');
    if (startEvalButton) {
        startEvalButton.addEventListener('click', function() {
            alert('开始评估');
        });
    }

    // 表格操作按钮点击事件
    const tableActionButtons = document.querySelectorAll('.data-table .btn-sm');
    tableActionButtons.forEach(button => {
        button.addEventListener('click', function() {
            alert(`执行${this.textContent}操作`);
        });
    });

    // 可视化卡片控制按钮点击事件
    const cardControlButtons = document.querySelectorAll('.card-controls .btn-sm');
    cardControlButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (!this.textContent.includes('active')) {
                alert(`执行${this.textContent}操作`);
            }
        });
    });

    // 设备标签点击事件
    const deviceTags = document.querySelectorAll('.device-tag');
    deviceTags.forEach(tag => {
        tag.addEventListener('click', function() {
            alert(`查看${this.textContent}详情`);
        });
    });

    // 等级标签点击事件
    const levelTags = document.querySelectorAll('.level-tag');
    levelTags.forEach(tag => {
        tag.addEventListener('click', function() {
            alert(`查看${this.textContent}等级详情`);
        });
    });

    // 建议项点击事件
    const suggestionItems = document.querySelectorAll('.suggestion-item');
    suggestionItems.forEach(item => {
        item.addEventListener('click', function() {
            const title = this.querySelector('h4').textContent;
            alert(`查看${title}详情`);
        });
    });

    // 排名项点击事件
    const rankingItems = document.querySelectorAll('.ranking-item');
    rankingItems.forEach(item => {
        item.addEventListener('click', function() {
            const name = this.querySelector('.rank-name').textContent;
            alert(`查看${name}详情`);
        });
    });

    // 3D可视化图片点击事件
    const visualizationImage = document.querySelector('.3d-placeholder img');
    if (visualizationImage) {
        visualizationImage.addEventListener('click', function() {
            alert('打开3D模型交互视图');
        });
    }

    // 快速操作按钮点击事件
    const quickActionButtons = document.querySelectorAll('.quick-actions .btn');
    quickActionButtons.forEach(button => {
        button.addEventListener('click', function() {
            alert(`执行${this.textContent}操作`);
        });
    });

    // 面包屑导航点击事件
    const breadcrumbLinks = document.querySelectorAll('.breadcrumb a');
    breadcrumbLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            alert(`导航到${this.textContent}`);
        });
    });
});