// import { createClient } from '@supabase/supabase-js'

// 全局变量
let supabase;
let currentParticipantId = null; // 添加全局变量存储当前参与者ID

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    
    
    // 初始化 Supabase 客户端
    const supabaseUrl = 'https://jqyhrtklxjzltwwejeoa.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeWhydGtseGp6bHR3d2VqZW9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyOTExNDgsImV4cCI6MjA1OTg2NzE0OH0.Ba2eJc3M-kYYc-zZNJ3LH2ZKJVs_bMRjUkziLo89vI4';
    
    // 确保Supabase库已加载
    if (typeof window.supabase === 'undefined') {
        console.error('Supabase库未加载，请检查网络连接或刷新页面');
        return;
    }
    
    // 创建Supabase客户端并赋值给全局变量
    supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    
    // 测试Supabase连接
    supabase.from('test_results').select('count').then(response => {
        console.log('Supabase连接成功:', response);
    }).catch(error => {
        console.error('Supabase连接失败:', error);
    });
    
    // 初始化测评系统
    initTest();
});


// 测评题目数据
const questions = [
    {
        id: 1,
        text: "当团队因流程松散导致效率低下时，你会优先采取哪种措施？",
        options: [
            { text: "立即制定明确分工表并严格执行", type: "gold" },
            { text: "组织讨论听取意见后再优化制度", type: "wood" },
            { text: "亲自示范操作标准以影响他人", type: "fire" },
            { text: "暂时观望，等待问题自然暴露", type: "water" }
        ],
        category: "gold"
    },
    {
        id: 2,
        text: "面对下属屡次违反公司制度但业绩突出，你的处理方式是？",
        options: [
            { text: "按规则处罚，强调纪律重要性", type: "gold" },
            { text: "私下沟通，给予改进机会", type: "water" },
            { text: "调整岗位以发挥其优势", type: "wood" },
            { text: "视而不见，结果优先", type: "fire" }
        ],
        category: "gold"
    },
    {
        id: 3,
        text: "项目陷入僵局需快速决策时，你会如何行动？",
        options: [
            { text: "根据数据直接拍板，减少讨论时间", type: "gold" },
            { text: "召集核心成员投票表决", type: "wood" },
            { text: "参考过往经验类比处理", type: "earth" },
            { text: "暂缓决策以收集更多信息", type: "water" }
        ],
        category: "gold"
    },
    {
        id: 4,
        text: "团队中有人质疑你的权威，你的反应是？",
        options: [
            { text: "公开重申职责划分以巩固权威", type: "gold" },
            { text: "单独沟通了解其真实诉求", type: "water" },
            { text: "调整管理方式以赢得认同", type: "wood" },
            { text: "忽略负面声音，专注目标推进", type: "fire" }
        ],
        category: "gold"
    },
    {
        id: 5,
        text: "如何培养新人的长期潜力？",
        options: [
            { text: "制定个性化学习计划并定期反馈", type: "wood" },
            { text: "安排导师一对一指导", type: "earth" },
            { text: "鼓励参与跨部门项目积累经验", type: "water" },
            { text: "直接分配任务以实战锻炼", type: "fire" }
        ],
        category: "wood"
    },
    {
        id: 6,
        text: "团队士气低落时，你会优先做什么？",
        options: [
            { text: "组织团建活动增强情感联结", type: "wood" },
            { text: "重新梳理目标与激励政策", type: "fire" },
            { text: "公开表彰优秀成员树立榜样", type: "gold" },
            { text: "调整任务分配减少压力源", type: "water" }
        ],
        category: "wood"
    },
    {
        id: 7,
        text: "下属提出创新方案但存在风险，你的态度是？",
        options: [
            { text: "评估可行性后支持试点", type: "wood" },
            { text: "要求完善细节再推进", type: "gold" },
            { text: "暂缓执行，优先保障稳定", type: "earth" },
            { text: "直接否决以避免失控", type: "fire" }
        ],
        category: "wood"
    },
    {
        id: 8,
        text: "跨部门合作中资源争夺激烈，你会如何应对？",
        options: [
            { text: "主动协商寻找共赢方案", type: "wood" },
            { text: "向上级申请额外资源", type: "water" },
            { text: "强调自身部门优先级", type: "fire" },
            { text: "暂时妥协避免冲突升级", type: "earth" }
        ],
        category: "wood"
    },
    {
        id: 9,
        text: "客户临时变更需求导致原计划失效，你的第一步行动是？",
        options: [
            { text: "召集团队重新评估可行性", type: "water" },
            { text: "直接与客户谈判缩小变更范围", type: "gold" },
            { text: "快速调整优先级分配资源", type: "fire" },
            { text: "向上级汇报寻求支持", type: "earth" }
        ],
        category: "water"
    },
    {
        id: 10,
        text: "团队成员因误解产生对立，你会如何调解？",
        options: [
            { text: "分别倾听双方立场后促成对话", type: "water" },
            { text: "制定共同目标转移矛盾焦点", type: "fire" },
            { text: "引入中立第三方协调", type: "wood" },
            { text: "明确责任归属以平息争议", type: "gold" }
        ],
        category: "water"
    },
    {
        id: 11,
        text: "行业政策突变影响战略方向，你的应对策略是？",
        options: [
            { text: "快速收集信息并启动预案", type: "water" },
            { text: "组织专家研讨新方向", type: "wood" },
            { text: "维持现状等待政策明朗", type: "earth" },
            { text: "收缩业务减少损失", type: "gold" }
        ],
        category: "water"
    },
    {
        id: 12,
        text: "如何向高层汇报复杂问题？",
        options: [
            { text: "用数据图表简化关键结论", type: "water" },
            { text: "分阶段陈述背景与建议", type: "earth" },
            { text: "准备多套方案供选择", type: "wood" },
            { text: "聚焦问题本身避免延伸", type: "gold" }
        ],
        category: "water"
    },
    {
        id: 13,
        text: "如何激发团队对高难度目标的热情？",
        options: [
            { text: "分解目标并设置里程碑奖励", type: "fire" },
            { text: "以身作则带头冲刺关键任务", type: "gold" },
            { text: "举办竞赛激发胜负欲", type: "wood" },
            { text: "强调目标对个人成长的价值", type: "water" }
        ],
        category: "fire"
    },
    {
        id: 14,
        text: "项目进度落后需赶工时，你的首要措施是？",
        options: [
            { text: "增加加班并承诺额外奖金", type: "fire" },
            { text: "优化流程减少冗余环节", type: "water" },
            { text: "抽调其他部门人员支援", type: "wood" },
            { text: "重新评估截止日期合理性", type: "earth" }
        ],
        category: "fire"
    },
    {
        id: 15,
        text: "面对竞争对手的激进策略，你的反应是？",
        options: [
            { text: "加速产品迭代抢占先机", type: "fire" },
            { text: "强化现有优势巩固客户", type: "earth" },
            { text: "分析对手弱点针对性反击", type: "gold" },
            { text: "寻求合作避免正面冲突", type: "water" }
        ],
        category: "fire"
    },
    {
        id: 16,
        text: "如何应对团队成员的消极抱怨？",
        options: [
            { text: "公开批评以遏制负面情绪", type: "gold" },
            { text: "私下沟通了解根源问题", type: "water" },
            { text: "忽略抱怨专注任务推进", type: "fire" },
            { text: "调整任务分配减少阻力", type: "wood" }
        ],
        category: "fire"
    },
    {
        id: 17,
        text: "如何提升团队对价值观的认同感？",
        options: [
            { text: "定期组织文化案例分享会", type: "earth" },
            { text: "将价值观纳入绩效考核", type: "gold" },
            { text: "领导者言行一致示范", type: "fire" },
            { text: "设计文化符号增强仪式感", type: "wood" }
        ],
        category: "earth"
    },
    {
        id: 18,
        text: "团队成员因背景差异产生摩擦，你的态度是？",
        options: [
            { text: "强调共性目标促进融合", type: "earth" },
            { text: "制定统一行为准则约束", type: "gold" },
            { text: "鼓励差异化优势互补", type: "wood" },
            { text: "减少协作以降低冲突", type: "water" }
        ],
        category: "earth"
    },
    {
        id: 19,
        text: "长期项目中如何维持团队稳定性？",
        options: [
            { text: "定期轮岗保持新鲜感", type: "wood" },
            { text: "设置阶段性成果庆祝", type: "fire" },
            { text: "提供职业发展路径承诺", type: "earth" },
            { text: "增加福利减少流失风险", type: "water" }
        ],
        category: "earth"
    },
    {
        id: 20,
        text: "公司面临舆论危机时，你的首要行动是？",
        options: [
            { text: "统一对外口径避免误解", type: "gold" },
            { text: "主动公开信息并道歉整改", type: "water" },
            { text: "内部排查问题根源", type: "earth" },
            { text: "冷处理等待热度消退", type: "fire" }
        ],
        category: "earth"
    }
];

// 领导力类型描述
const typeDescriptions = {
    gold: {
        title: "金型领导力（刚毅决断·规则导向）",
        description: '您是一位注重规则和秩序的领导者，擅长制定明确的标准和流程，并确保团队严格执行。典型人物如《三国演义》中曹操"割发代首"立威示法、"设五色棒"整肃纲纪，其性格刚毅果决且深谙权谋之道，善用郭嘉荀彧等谋士成就霸业。您的决策风格果断坚定，善于在复杂情况下快速做出判断。您重视纪律和责任，期望团队成员遵守既定规范。在危机时刻，您能够保持冷静并采取果断行动。',
        upward: "与金型上级沟通时：建议注重准备详实的数据和执行计划，以简洁、逻辑清晰的方式汇报。强调对规则的遵守和执行的严谨性，展示您对效率和质量的重视。在提出建议时，确保有充分的数据支持。",
        downward: "与金型下属沟通时：建议提供清晰的指示和期望，设定明确的目标和时间表。同时，适当放松对细节的控制，给予团队一定的自主空间，并学会欣赏不同的工作方式。定期提供具体的反馈，帮助下属改进。"
    },
    wood: {
        title: "木型领导力（成长驱动·团队协作）",
        description: '您是一位注重团队发展和人才培养的领导者，善于创造协作环境，激发团队潜能。典型人物如《三国演义》中孙权"联刘抗曹"缔造赤壁神话、"劝学吕蒙"成就士别三日之典，其性格深谋远虑且善育新锐，以包容胸襟凝聚江东才俊定鼎伟业。您重视每个成员的成长，愿意投入时间指导和培养人才。您的管理风格鼓励创新和尝试，能够在保持团队和谐的同时推动变革。您擅长构建团队凝聚力，促进成员间的相互支持。',
        upward: "与木型上级沟通时：建议强调团队协作和成长的过程，展示项目如何促进团队发展。分享创新想法和改进建议，表现出学习和成长的意愿。注重沟通的互动性，积极参与讨论和反馈。",
        downward: "与木型下属沟通时：建议采用开放式提问和积极倾听，鼓励他们表达想法和顾虑。提供发展机会和建设性反馈，帮助他们成长。在团队会议中创造包容氛围，确保每个人都发言的机会，同时明确团队共同目标。"
    },
    water: {
        title: "水型领导力（灵活应变·沟通协调）",
        description: '您是一位善于适应变化和沟通协调的领导者，能够在复杂多变的环境中灵活应对。典型人物如《三国演义》中诸葛亮"草船借箭"巧借天时、"七擒孟获"攻心为上，其性格谋定后动且通权达变，以超凡智慧化解危机。您擅长收集和分析信息，在做决策前全面考虑各种可能性。您的外交手腕出色，能够调和不同立场，促成共识。您重视倾听和理解，能够感知团队情绪变化并及时调整策略。',
        upward: "与水型上级沟通时：建议提供多角度的分析和灵活的解决方案，展示对形势的敏锐把握。保持开放和适应性的态度，愿意根据反馈调整方案。注重建立融洽的沟通氛围，适时寻求指导和建议。",
        downward: "与水型下属沟通时：建议创造开放的对话环境，鼓励不同意见的表达。清晰传达背景信息和目标，但给予团队足够的自主权决定实施方法。关注团队成员的情绪变化，及时提供支持和指导，帮助他们应对变化和挑战。"
    },
    fire: {
        title: "火型领导力（激情推动·目标导向）",
        description: '您是一位充满激情和驱动力的领导者，擅长激励团队追求卓越和突破。典型人物如《三国演义》中关羽"过五关斩六将"彰显忠义无双、"单刀赴会"尽显英雄胆魄，其性格忠义凛然且傲骨英风，以"千里走单骑"的执着诠释火型领导的目标导向。您对目标有强烈的关注，能够持续推动团队向前。您的能量和热情具有感染力，能够点燃团队的工作热情。您勇于面对挑战，在竞争中保持进取精神，不断寻求突破和创新。',
        upward: "与火型上级沟通时：建议展示对目标的热情和承诺，强调突破性进展和创新成果。以简洁有力的方式展示成就和影响力。在汇报时保持积极向上的态度，展现出强烈的进取心和行动力。",
        downward: "与火型下属沟通时：建议清晰传达目标和期望，激发他们的热情和动力。提供足够的挑战和机会，同时给予必要的支持和资源。认可和庆祝成功，建立积极的反馈文化。注意控制情绪波动，避免过度施压，确保团队可持续发展。"
    },
    earth: {
        title: "土型领导力（稳定包容·文化塑造）",
        description: '您是一位注重稳定和包容的领导者，善于创造和谐的工作环境和强大的团队文化。典型人物如《三国演义》中如刘备"携民渡江"践行仁德、"三顾茅庐"诚纳贤才，其性格宽厚弘毅且坚韧不拔，以人格魅力缔造蜀汉根基。您重视长期发展和可持续性，能够在变化中保持核心价值观。您包容不同的观点和背景，善于整合多元化的团队。您关注团队成员的归属感和认同感，能够建立深深的信任关系。',
        upward: "与土型上级沟通时：建议强调工作的可持续性和团队的稳定发展，展示对组织文化的理解和认同。以踏实稳重的方式汇报，注重细节的同时不失全局观。在沟通中表现出对团队凝聚力的重视。",
        downward: "与土型下属沟通时：建议强调团队的共同价值观和使命感，创造包容支持和环境。关注每个成员的归属感和认同感，帮助他们找到自己的位置和价值。在变化和挑战面前，提供稳定的支持和明确的方向，帮助团队保持信心和凝聚力。"
    }
};

const type_eng2ch = {
    gold: '金',
    wood: '木',
    water: '水',
    fire:'火',
    earth:'土',
}

// 五行相生相克关系
const elementRelations = {
    // 相生关系
    generating: {
        gold: "water", // 金生水
        water: "wood", // 水生木
        wood: "fire",  // 木生火
        fire: "earth", // 火生土
        earth: "gold"  // 土生金
    },
    // 相克关系
    overcoming: {
        gold: "wood",  // 金克木
        wood: "earth", // 木克土
        earth: "water", // 土克水
        water: "fire", // 水克火
        fire: "gold"   // 火克金
    }
};

// 初始化测评系统
function initTest() {
    const startTestBtn = document.getElementById('startTestBtn');
    const testSection = document.getElementById('testSection');
    const introSection = document.querySelector('.intro');
    const qrSection = document.querySelector('.qr-section');
    const questionContainer = document.getElementById('questionContainer');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const progressBar = document.getElementById('progressBar');
    const resultSection = document.getElementById('resultSection');
    const restartBtn = document.getElementById('restartBtn');
    //****获取姓名输入框
    const nameInput = document.getElementById('nameInput');
    const deptInput = document.getElementById('deptInput');
    let currentQuestionIndex = 0;
    let answers = {};

    // 开始测评按钮点击事件
    startTestBtn.addEventListener('click', function() {
        // ****新加输入姓名
        const name = nameInput.value.trim();
        if (!name) {
            alert('请输入您的姓名！');
            return;
        }
        //
        introSection.style.display = 'none';
        qrSection.style.display = 'none';
        testSection.style.display = 'block';

        // ****保存用户信息到 Supabase
        saveParticipantInfo(name);
        
        // 加载第一个问题
        loadQuestion(currentQuestionIndex);
    });
    
    
    // 获取部门名称
    function getDepartmentValue() {
        const deptSelect = document.getElementById('deptSelect');
        const deptInput = document.getElementById('deptInput');
        if (deptSelect && deptSelect.value === 'other') {
            return deptInput ? deptInput.value.trim() : '';
        } else {
            return deptSelect ? deptSelect.value : '';
        }
    }
    
    // 新增：获取部门五行类型
    function getDepartmentType() {
        const deptSelect = document.getElementById('deptSelect');
        const wuxingTypeSelect = document.getElementById('wuxingTypeSelect');
        if (deptSelect && deptSelect.value === 'other') {
            return wuxingTypeSelect ? wuxingTypeSelect.value : '';
        } else {
            // 取选中option的data-type
            const selectedOption = deptSelect.options[deptSelect.selectedIndex];
            return selectedOption && selectedOption.getAttribute('data-type') ? selectedOption.getAttribute('data-type') : '';
        }
    }
    
    // 保存参与者信息
    async function saveParticipantInfo(participantName) {
        try {
            if (!supabase) {
                throw new Error('Supabase客户端未初始化');
            }
            const department = getDepartmentValue();
            const department_type = getDepartmentType(); // 新增
            const { data, error } = await supabase
                .from('test_results')
                .insert([
                    {
                        name: participantName,
                        department: department,
                        department_type: department_type, // 新增
                        scores:{},
                        percentages: {}
                    }
                ])
                .select(); // 添加select()以获取插入的数据
            if (error) throw error;
            if (data && data.length > 0) {
                currentParticipantId = data[0].id; // 保存返回的UUID
                console.log('保存成功，参与者ID:', currentParticipantId);
                return true;
            }
            return false;
        } catch (error) {
            console.error('保存失败:', error);
            alert('保存失败，请重试');
            return false;
        }
    }
    

    // 上一题按钮点击事件
    prevBtn.addEventListener('click', function() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            loadQuestion(currentQuestionIndex);
            updateProgressBar();
        }
    });
    
    // 下一题按钮点击事件
    nextBtn.addEventListener('click', function() {
        // 获取当前活动的问题元素
        const currentQuestion = document.querySelector('.question.active');
        if (!currentQuestion) return;

        // 获取当前问题中的所有选项
        const options = currentQuestion.querySelectorAll('.option');
        let selectedOption = null;

        // 遍历所有选项，找到选中的选项
        options.forEach(option => {
            if (option.classList.contains('selected')) {
                selectedOption = option;
            }
        });
        
        // 如果没有选择选项，不显示提示，直接返回
        if (!selectedOption) {
            alert('请选择一个选项！');
            return;
        }
        
        const questionId = questions[currentQuestionIndex].id;
        const optionType = selectedOption.getAttribute('data-type');
        answers[questionId] = optionType;
        
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            loadQuestion(currentQuestionIndex);
            updateProgressBar();
        } else {
            // 测评完成，显示结果
            showResults();
        }
    });
    
    // 重新测评按钮点击事件
    restartBtn.addEventListener('click', function() {
        resultSection.style.display = 'none';
        introSection.style.display = 'block';
        qrSection.style.display = 'flex';
        currentQuestionIndex = 0;
        answers = {};
    });
    
    // 加载问题
    function loadQuestion(index) {
        const question = questions[index];
        questionContainer.innerHTML = '';
        
        const questionElement = document.createElement('div');
        questionElement.className = 'question active';
        questionElement.innerHTML = `
            <h3>问题 ${index + 1}/${questions.length}</h3>
            <p>${question.text}</p>
            <div class="options"></div>
        `;
        
        const optionsContainer = questionElement.querySelector('.options');
        
        question.options.forEach((option, optionIndex) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.setAttribute('data-type', option.type);
            optionElement.textContent = `${String.fromCharCode(65 + optionIndex)}. ${option.text}`;
            
            // 如果已经回答过，选中之前的选项
            if (answers[question.id] && answers[question.id] === option.type) {
                optionElement.classList.add('selected');
            }
            
            optionElement.addEventListener('click', function() {
                // 移除其他选项的选中状态
                const options = optionsContainer.querySelectorAll('.option');
                options.forEach(opt => opt.classList.remove('selected'));
                
                // 选中当前选项
                this.classList.add('selected');
            });
            
            optionsContainer.appendChild(optionElement);
        });
        
        questionContainer.appendChild(questionElement);
        
        // 更新按钮状态
        prevBtn.disabled = index === 0;
        nextBtn.textContent = index === questions.length - 1 ? '完成测评' : '下一题';
    }
    
    // 更新进度条
    function updateProgressBar() {
        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
        progressBar.style.width = `${progress}%`;
    }
    
    // 显示测评结果
    async function showResults() {
        testSection.style.display = 'none';
        resultSection.style.display = 'block';
        


        // 清除旧匹配结果（新增部分）
        const oldMatches = document.querySelectorAll('.match-results-container');
        oldMatches.forEach(element => element.remove());

        // 计算各元素得分
        const scores = calculateScores();
        const percentages = calculatePercentage(scores);

        // 计算余弦相似度
        const userVector = vectorizePercentages(percentages, TYPE_ORDER);
        const database = await loadData('leadership_archetypes.json');
        const topMatches = findTopMatches(userVector, database);

        // 创建新容器（添加唯一标识类名）
        const matchResultsContainer = document.createElement('div');
        matchResultsContainer.className = 'match-results-container'; // 添加专属类名
        matchResultsContainer.innerHTML = '<h3 style="margin-left: 20px;">领导力类型最为匹配的人物 </h3>';

        
        topMatches.forEach(({ person, similarity }, index) => {
            const matchElement = document.createElement('div');
            matchElement.className = 'communication-tips'; // 使用与沟通建议相同的样式

            // 添加金木水火土比例显示
            const personPercentages = person.types.reduce((acc, type) => {
                acc[type.type] = type.weight;
                return acc;
            }, {});

            const percentagesHtml = Object.entries(personPercentages)
                .map(([type, weight]) => `${type_eng2ch[type]}: ${(weight * 100).toFixed(0)}%`)
                .join(', ');

            matchElement.style.marginBottom = '5px'; // 缩小每个匹配分析之间的空行

            matchElement.innerHTML = `
            <h4>${index + 1}. ${person.name} (相似度: ${(similarity * 100).toFixed(2)}%, ${percentagesHtml})</h4>
            <p style="font-size: 0.9em; margin: 5px 0; margin-left: 20px;"><strong>性格特质:</strong> ${person.traits.join(', ')}</p>
            <p style="font-size: 0.9em; margin: 5px 0; margin-left: 20px;"><strong>典型事例:</strong> ${person.examples.join(', ')}</p>
        `;

            matchResultsContainer.innerHTML += matchElement.outerHTML; // 更新内容
        });

        // ****将匹配结果添加到结果部分
        resultSection.insertBefore(matchResultsContainer, document.getElementById('restartBtn'));


        // 找出主导类型
        const primaryType = findPrimaryType(scores);
        
        // 更新结果显示
        document.getElementById('primaryType').textContent = typeDescriptions[primaryType].title;
        document.getElementById('typeDescription').textContent = typeDescriptions[primaryType].description;
        
        // 更新沟通建议
        document.getElementById('upwardCommunication').textContent = typeDescriptions[primaryType].upward;
        document.getElementById('downwardCommunication').textContent = typeDescriptions[primaryType].downward;
        
        // 生成详细分析
        generateDetailedAnalysis(scores, primaryType);
        
        // 绘制图表
        drawChart(percentages);

        // ****保存测评结果到 Supabase
        saveAssessmentResults(scores, percentages);

        // // ****绘制领导力类型关系网络
        // render3DProjection(percentages, topMatches, database);
        
        // // 更新容器HTML
        // document.getElementById('networkSection').innerHTML = `
        //     <h3>领导力三维投影</h3>
        //     <div id="3dContainer" style="height: 600px;"></div>
        //     <div class="projection-legend">
        //         ${Object.entries(typeColors).map(([type, color]) => `
        //             <div class="legend-item">
        //                 <span class="legend-color" style="background:${color}"></span>
        //                 ${type_eng2ch[type]}型领导力
        //             </div>
        //         `).join('')}
        //         <div class="legend-item">
        //             <span class="legend-color" style="background:#4a148c"></span>
        //             您的定位
        //         </div>
        //     </div>
        // `;
    }
    // 保存测评结果
    async function saveAssessmentResults(scores, percentages) {
        try {
            if (!supabase || !currentParticipantId) {
                throw new Error('Supabase客户端未初始化或参与者ID不存在');
            }
            
            // 首先更新当前记录
            const { data: updateData, error: updateError } = await supabase
                .from('test_results')
                .update({
                    scores: scores,
                    percentages: percentages
                })
                .eq('id', currentParticipantId)
                .select();
                
            if (updateError) throw updateError;
            console.log('测评结果保存成功:', updateData);
        } catch (error) {
            console.error('保存测评结果失败:', error);
            alert('保存测评结果失败，请重试');
        }
    }


    // 计算各元素得分
    function calculateScores() {
        const scores = {
            gold: 0,
            wood: 0,
            water: 0,
            fire: 0,
            earth: 0
        };
        
        // 统计各类型选择次数
        for (const questionId in answers) {
            const type = answers[questionId];
            scores[type]++;
        }
        
        // // 计算百分比（总分为4分） 
        // for (let type in scores) {
        //     scores[type] = Math.round((scores[type] / 4) * 100);
        // }
        
        return scores;
    }

    // 新加--计算各元素得分百分比
    function calculatePercentage(scores) {
        const percentages = {
            gold: 0,
            wood: 0,
            water: 0,
            fire: 0,
            earth: 0
    };
    
        for (let type in percentages) {
            percentages[type] = Math.round((scores[type] / 20) * 100);
        }
        
        
        return percentages;
    }

    // 找出主导类型
    function findPrimaryType(scores) {
        let maxScore = 0;
        let primaryType = '';
        
        for (const type in scores) {
            if (scores[type] > maxScore) {
                maxScore = scores[type];
                primaryType = type;
            }
        }
        
        return primaryType;
    }
    
    // 生成详细分析
    function generateDetailedAnalysis(scores, primaryType) {
        const detailedAnalysis = document.getElementById('detailedAnalysis');
        detailedAnalysis.innerHTML = ''; // 清空旧内容

        const elementNames = {
            gold: '金',
            wood: '木',
            water: '水',
            fire: '火',
            earth: '土'
        };
        const typeDescriptions = { /* ... 确保这里有类型描述 ... */ }; // 假设 typeDescriptions 已经定义

        // 1. 分析各元素得分
        const elements = ['gold', 'wood', 'water', 'fire', 'earth'];
        elements.forEach(element => {
            const elementScore = scores[element];
            const maxPossibleScore = 20; // 假设每个元素最多20分
            const percentage = Math.round((elementScore / maxPossibleScore) * 100);

            const elementAnalysis = document.createElement('div');
            elementAnalysis.className = 'element-analysis'; // 你可能需要定义这个class的样式
            elementAnalysis.innerHTML = `
                <div class="element">
                    <div class="element-icon ${element}">${elementNames[element]}</div>
                    <div class="element-desc">
                        <strong>${typeDescriptions[element]?.title || elementNames[element]}</strong> <!-- 添加了?. 和 || 以防万一 -->
                        <div class="score-bar" style="width:100%; background-color: #eee; border-radius: 3px;">
                            <div class="score-fill" style="width: ${percentage}%; height: 8px; background-color: ${getElementColor(element)}; border-radius: 3px;"></div>
                        </div>
                        <span>得分: ${elementScore}/${maxPossibleScore} (${percentage}%)</span>
                    </div>
                </div>
                <p style="margin-left: 55px; font-size: 0.9em; color: #555;">${getElementAnalysis(element, elementScore, primaryType)}</p>
            `;
            detailedAnalysis.appendChild(elementAnalysis);
        });

        // 2. 添加五行平衡分析（带图片）
        const balanceAnalysisContainer = document.createElement('div');
        balanceAnalysisContainer.className = 'balance-analysis-container'; // 使用我们新加的CSS class
        
        // const imgElement = document.createElement('img');
        // imgElement.src = '5elements.png'; // 使用项目根目录下的相对路径
        // imgElement.alt = '五行相生相克图';
        // imgElement.width = 200; // 确保图片宽度为200px
        // imgElement.style.display = 'block'; // 确保图片为块级元素

        const imgElement = document.createElement('img');
        imgElement.src = '5elements.png';
        imgElement.alt = '五行相生相克图';
        imgElement.className = 'element-relation-img'; // 添加class
        balanceAnalysisContainer.appendChild(imgElement);
        // // 添加移动端专用图片
        // const mobileImg = document.createElement('img');
        // mobileImg.src = '5elements.png';
        // mobileImg.className = 'mobile-element-img';
        // mobileImg.alt = '五行关系图';
        // balanceAnalysisContainer.appendChild(mobileImg);

        const textContentDiv = document.createElement('div');
        textContentDiv.className = 'text-content';
        textContentDiv.innerHTML = `
            <h4>领导力发展分析</h4>
            <p>${getBalanceAnalysis(scores, primaryType)}</p>
        `;
        
        balanceAnalysisContainer.appendChild(imgElement);
        balanceAnalysisContainer.appendChild(textContentDiv);

        detailedAnalysis.appendChild(balanceAnalysisContainer);
    }

    // Helper function to get element color (you might already have this or similar)
    function getElementColor(element) {
        switch(element) {
            case 'gold': return '#FFD700';
            case 'wood': return '#228B22';
            case 'water': return '#1E90FF';
            case 'fire': return '#FF4500';
            case 'earth': return '#CD853F';
            default: return '#ccc';
        }
    }

    // 获取元素分析文本
    function getElementAnalysis(element, score, primaryType) {
        const maxScore = 4;
        let analysisText = '';
        
        if (element === primaryType) {
            analysisText = `这是您的主导领导力类型。${score >= 3 ? '您在这方面表现出很强的特质。' : '虽然这是您的主导类型，但强度适中，可以考虑有意识地增强这方面的能力。'}`;
        } else if (score >= 3) {
            analysisText = `虽然不是主导类型，但您在${typeDescriptions[element].title}方面也表现出很强的特质。`;
        } else if (score <= 1) {
            analysisText = `这是您相对薄弱的领导力维度，可以有意识地提升这方面的能力。`;
        } else {
            analysisText = `您在这方面表现出中等水平的特质。`;
        }
        
        return analysisText;
    }
    
    // 获取五行平衡分析
    function getBalanceAnalysis(scores, primaryType) {
        // 检查是否有明显的不平衡
        const maxScore = Math.max(...Object.values(scores));
        const minScore = Math.min(...Object.values(scores));
        const gap = maxScore - minScore;
        
        let balanceText = '';
        
        if (gap >= 3) {
            balanceText += '您的领导力风格存在明显的不平衡，某些维度特别突出而其他维度相对薄弱。';
        } else if (gap <= 1) {
            balanceText += '您的领导力风格相对平衡，各个维度发展较为均衡。';
        } else {
            balanceText += '您的领导力风格有一定的偏好，但整体较为均衡。';
        }

        const elementNames = {
            gold: '金',
            wood: '木',
            water: '水',
            fire: '火',
            earth: '土'
        };
        
        // 分析相生关系
        const generatingType = elementRelations.generating[primaryType];
        const generatedByType = Object.keys(elementRelations.generating).find(key => elementRelations.generating[key] === primaryType);
        
        balanceText += `\n\n根据五行相生理论，${typeDescriptions[primaryType].title}可以增强${typeDescriptions[generatingType].title}（${elementNames[primaryType]}生${elementNames[generatingType]}），同时被${typeDescriptions[generatedByType].title}增强（${elementNames[generatedByType]}生${elementNames[primaryType]}）。`;
        
        // 分析相克关系
        const overcomingType = elementRelations.overcoming[primaryType];
        const overcomeByType = Object.keys(elementRelations.overcoming).find(key => elementRelations.overcoming[key] === primaryType);
        
        balanceText += `\n\n在五行相克关系中，${typeDescriptions[primaryType].title}可能会抑制${typeDescriptions[overcomingType].title}（${elementNames[primaryType]}克${elementNames[overcomingType]}），同时可能被${typeDescriptions[overcomeByType].title}所抑制（${elementNames[overcomeByType]}克${elementNames[primaryType]}）。`;
        
        // 提供平衡建议
        if (scores[overcomingType] >= 3 && scores[primaryType] >= 3) {
            balanceText += `\n\n您的${typeDescriptions[primaryType].title}和${typeDescriptions[overcomingType].title}都较强，可能会导致内部冲突，建议在不同情境下有意识地选择合适的领导风格。`;
        }
        
        if (scores[generatingType] <= 1) {
            balanceText += `\n\n您可以有意识地发展${typeDescriptions[generatingType].title}，这将与您的主导类型形成良性互补。`;
        }
        
        return balanceText;
    }
    
    // 绘制雷达图
    let resultChart = null; // 添加全局变量存储图表实例

    function drawChart(percentages) {
        if (!document.getElementById('resultChart')) return;
        
        const ctx = document.getElementById('resultChart').getContext('2d');
        
        // 如果已存在图表实例，先销毁它
        if (resultChart) {
            resultChart.destroy();
        }
        
        // 修改容器尺寸设置
        const chartContainer = document.querySelector('.chart-container');
        chartContainer.style.width = '100%';
        chartContainer.style.height = 'auto';
        chartContainer.style.aspectRatio = '1.5'; // 保持宽高比

        // 准备数据
        const data = {
            labels: [
                '金（刚毅决断）',
                '木（成长协作）',
                '水（灵活应变）',
                '火（激情目标）',
                '土（稳定包容）'
            ],
            datasets: [{
                label: '五行领导力分布',
                data: [
                    percentages.gold,
                    percentages.wood,
                    percentages.water,
                    percentages.fire,
                    percentages.earth
                ],
                fill: true,
                backgroundColor: 'rgba(75, 0, 130, 0.2)',
                borderColor: 'rgb(75, 0, 130)',
                pointBackgroundColor: 'rgb(75, 0, 130)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(75, 0, 130)',
                pointRadius: 5,
                pointHoverRadius: 8
            }]
        };
        
        const datavalue = [
            percentages.gold,
            percentages.wood,
            percentages.water,
            percentages.fire,
            percentages.earth
        ];

        const maxvalue = Math.max(...datavalue);

        // 配置选项
        const options = {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: maxvalue + 10,
                    ticks: {
                        stepSize: 10,
                        display: true,
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.raw}%`;
                        }
                    }
                },
                datalabels: {
                    display: true,
                    color: 'rgb(75, 0, 130)',
                    font: {
                        weight: 'bold',
                        size: 12
                    },
                    formatter: function(value) {
                        return value + '%';
                    },
                    anchor: 'end',
                    align: 'end',
                    offset: 8
                }
            },
            maintainAspectRatio: false,
            elements: {
                line: {
                    tension: 0
                }
            }
        };
        
        // 创建新的图表实例并保存到全局变量
        resultChart = new Chart(ctx, {
            type: 'radar',
            data: data,
            options: options,
            plugins: [ChartDataLabels],
            responsiveAnimationDuration: 300
        });
    }

    // 定义五行类型顺序（固定向量位置）
    const TYPE_ORDER = ["gold", "water", "fire", "wood", "earth"];

    // 加载JSON数据库
    async function loadData(filepath) {
        const response = await fetch(filepath);
        return await response.json();
    }

    // 将类型列表转换为标准顺序的向量
    function vectorizeTypes(types, typeOrder) {
        const typeDict = types.reduce((acc, t) => {
            acc[t.type] = t.weight;
            return acc;
        }, {});
        return typeOrder.map(t => typeDict[t] || 0.0);
    }

    function vectorizePercentages(percentages, typeOrder) {
        return typeOrder.map(type => percentages[type] || 0);
    }
    // 计算余弦相似度
    function cosineSimilarity(vecA, vecB) {
        const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
        const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
        const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
        return dot / (normA * normB) || 0.0;
    }

    // 匹配相似度最高的人物
    function findTopMatches(userVector, database, topN = 5) {
        const scores = database.leadership_archetypes.map(person => {
            const personVec = vectorizeTypes(person.types, TYPE_ORDER);
            const similarity = cosineSimilarity(userVector, personVec);
            return { person, similarity };
        });
        return scores.sort((a, b) => b.similarity - a.similarity).slice(0, topN);
    }

    function vectorizePercentages(percentages, typeOrder) {
        return typeOrder.map(type => percentages[type] || 0);
    }

}

  

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
   
    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        .score-bar {
            width: 100%;
            height: 8px;
            background-color: #f0f0f0;
            border-radius: 4px;
            margin: 5px 0;
            overflow: hidden;
        }
        .score-fill {
            height: 100%;
            background-color: #4a148c;
        }
        .element-analysis {
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #eee;
        }
        .element-analysis-text {
            margin-top: 10px;
            padding-left: 55px;
        }
        .balance-analysis {
            margin-top: 30px;
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 5px;
        }
    `;
    document.head.appendChild(style);
});