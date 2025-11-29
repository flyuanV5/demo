document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    const treeView = document.querySelector('.tree-view');
    const selectedObjectsContainer = document.querySelector('.selected-objects');
    const indicatorSelectionContainer = document.querySelector('.indicator-selection');
    const settingBtn = document.querySelector('.setting-btn');
    const rightPanel = document.querySelector('.right-panel');
    const selectedIndicatorsContainer = document.querySelector('.selected-indicators');
    const summaryP = document.querySelector('.selection-summary p');

    const dataIndicators = {
        '热力站': [
            { group: '温度', indicators: ['一次供温', '一次回温', '室外温度'] },
            { group: '压力', indicators: ['一次供压', '一次回压'] },
            { group: '热量', indicators: ['一次热量'] },
            { group: '流量', indicators: ['一次流量'] }
        ],
        '机组': [
            { group: '温度', indicators: ['二次供温', '二次回温'] },
            { group: '压力', indicators: ['二次供压', '二次回压'] }
        ],
        '热泵': [
            { group: '状态', indicators: ['启停状态', '运行频率'] }
        ]
    };

    rightPanel.style.display = 'none';

    function updateSelectionSummary() {
        const selectedObjectsCount = treeView.querySelectorAll('input[type="checkbox"]:checked').length;
        const selectedIndicatorsCount = indicatorSelectionContainer.querySelectorAll('input[type="checkbox"]:checked').length;
        summaryP.textContent = `已选择 ${selectedObjectsCount} 个对象，共 ${selectedIndicatorsCount} 个指标`;

        selectedIndicatorsContainer.innerHTML = '';
        const selectedIndicatorCheckboxes = indicatorSelectionContainer.querySelectorAll('input[type="checkbox"]:checked');
        selectedIndicatorCheckboxes.forEach(checkbox => {
            const indicatorName = checkbox.nextElementSibling.textContent;
            const tag = document.createElement('span');
            tag.classList.add('selected-tag');
            tag.textContent = indicatorName;
            const removeBtn = document.createElement('span');
            removeBtn.classList.add('remove-tag');
            removeBtn.textContent = 'x';
            tag.appendChild(removeBtn);
            selectedIndicatorsContainer.appendChild(tag);
        });
    }

    function updateSelectedObjects() {
        selectedObjectsContainer.innerHTML = '';
        const checkedCheckboxes = treeView.querySelectorAll('input[type="checkbox"]:checked');
        
        const selected = {
            '热力站': [],
            '机组': [],
            '热泵': []
        };

        checkedCheckboxes.forEach(checkbox => {
            const label = checkbox.nextElementSibling;
            const type = label.nextElementSibling.textContent;
            const name = label.textContent;

            if(selected[type]) {
                selected[type].push(name);
            }
        });

        for (const type in selected) {
            if (selected[type].length > 0) {
                const group = document.createElement('div');
                group.classList.add('selected-group');
                const typeLabel = document.createElement('span');
                typeLabel.classList.add('type-label');
                typeLabel.textContent = `${type} (${selected[type].length})`;
                group.appendChild(typeLabel);

                selected[type].forEach(name => {
                    const tag = document.createElement('span');
                    tag.classList.add('selected-tag');
                    tag.textContent = name;
                    const removeBtn = document.createElement('span');
                    removeBtn.classList.add('remove-tag');
                    removeBtn.textContent = 'x';
                    tag.appendChild(removeBtn);
                    group.appendChild(tag);
                });
                selectedObjectsContainer.appendChild(group);
            }
        }
        updateSelectionSummary();
    }

    function updateIndicatorSelection() {
        indicatorSelectionContainer.innerHTML = '<h2>数据指标 (最多选择8个)</h2>';
        const checkedCheckboxes = treeView.querySelectorAll('input[type="checkbox"]:checked');
        const selectedTypes = new Set();
        const selectedObjects = {};

        checkedCheckboxes.forEach(checkbox => {
            const label = checkbox.nextElementSibling;
            const type = label.nextElementSibling.textContent;
            selectedTypes.add(type);
            if (!selectedObjects[type]) {
                selectedObjects[type] = [];
            }
            selectedObjects[type].push(label.textContent);
        });

        selectedTypes.forEach(type => {
            if (dataIndicators[type]) {
                const typeGroup = document.createElement('div');
                typeGroup.classList.add('indicator-type-group');

                const typeHeader = document.createElement('h3');
                const count = selectedObjects[type] ? selectedObjects[type].length : 0;
                typeHeader.textContent = `${type} (${count}个对象)`;
                typeGroup.appendChild(typeHeader);

                dataIndicators[type].forEach(groupData => {
                    const indicatorGroup = document.createElement('div');
                    indicatorGroup.classList.add('indicator-group');

                    const groupLabel = document.createElement('strong');
                    groupLabel.textContent = groupData.group;
                    indicatorGroup.appendChild(groupLabel);

                    const indicatorsList = document.createElement('ul');
                    groupData.indicators.forEach(indicator => {
                        const item = document.createElement('li');
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        const checkboxId = `indicator-${type}-${indicator.replace(/\s/g, '-')}`;
                        checkbox.id = checkboxId;
                        const label = document.createElement('label');
                        label.htmlFor = checkboxId;
                        label.textContent = indicator;
                        item.appendChild(checkbox);
                        item.appendChild(label);
                        indicatorsList.appendChild(item);
                    });
                    indicatorGroup.appendChild(indicatorsList);
                    typeGroup.appendChild(indicatorGroup);
                });

                indicatorSelectionContainer.appendChild(typeGroup);
            }
        });
        updateSelectionSummary();
    }

    function updateSettingsPanel() {
        const indicatorSettingsContainer = document.querySelector('.indicator-settings');
        indicatorSettingsContainer.innerHTML = '<h2>指标设置</h2>'; 

        const selectedIndicatorCheckboxes = indicatorSelectionContainer.querySelectorAll('input[type="checkbox"]:checked');

        if (selectedIndicatorCheckboxes.length === 0) {
            indicatorSettingsContainer.innerHTML += '<p>请先选择指标</p>';
            return;
        }

        const settingsContent = document.createElement('div');
        
        selectedIndicatorCheckboxes.forEach(checkbox => {
            const indicatorName = checkbox.nextElementSibling.textContent;
            const settingItem = document.createElement('div');
            settingItem.textContent = `设置 for ${indicatorName}`;
            settingsContent.appendChild(settingItem);
        });

        indicatorSettingsContainer.appendChild(settingsContent);
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'confirm-btn';
        confirmBtn.textContent = '确定';
        indicatorSettingsContainer.appendChild(confirmBtn);
    }

    treeView.addEventListener('click', (event) => {
        const target = event.target;

        if (target.tagName === 'INPUT' && target.type === 'checkbox') {
            const parentLi = target.closest('li');
            const childrenUl = parentLi.querySelector('ul');

            if (childrenUl) {
                const childCheckboxes = childrenUl.querySelectorAll('input[type="checkbox"]');
                childCheckboxes.forEach(checkbox => {
                    checkbox.checked = target.checked;
                });
            }

            updateParentCheckbox(parentLi);
            updateSelectedObjects();
            updateIndicatorSelection();
        }

        if (target.tagName === 'LABEL') {
            const parentLi = target.closest('li');
            const childrenUl = parentLi.querySelector('ul');
            if (childrenUl) {
                childrenUl.style.display = childrenUl.style.display === 'none' ? 'block' : 'none';
            }
        }
    });

    indicatorSelectionContainer.addEventListener('change', (event) => {
        if (event.target.tagName === 'INPUT' && event.target.type === 'checkbox') {
            updateSelectionSummary();
            if (rightPanel.style.display === 'block') {
                updateSettingsPanel();
            }
        }
    });

    settingBtn.addEventListener('click', () => {
        const isHidden = rightPanel.style.display === 'none';
        rightPanel.style.display = isHidden ? 'block' : 'none';
        settingBtn.textContent = isHidden ? '收起设置' : '指标设置';
        if (isHidden) {
            updateSettingsPanel();
        }
    });

    function updateParentCheckbox(childLi) {
        const parentUl = childLi.closest('ul');
        if (!parentUl) return;

        const parentLi = parentUl.closest('li');
        if (!parentLi) return;

        const parentCheckbox = parentLi.querySelector('input[type="checkbox"]');
        if (!parentCheckbox) return;

        const siblingCheckboxes = parentUl.querySelectorAll('input[type="checkbox"]');
        const allChecked = Array.from(siblingCheckboxes).every(checkbox => checkbox.checked);

        parentCheckbox.checked = allChecked;

        updateParentCheckbox(parentLi);
    }

    updateSelectedObjects();
    updateIndicatorSelection();
});