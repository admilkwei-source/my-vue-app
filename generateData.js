import fs from 'fs';

// 生成大量时间段数据（用于折线图）
function generateTimeData(count) {
    const data = [];
    const roles = ['业主', '访客', '出租'];
    
    for (let i = 0; i < count; i++) {
        const hour = Math.floor(Math.random() * 24);
        const minute = Math.floor(Math.random() * 60);
        const role = roles[Math.floor(Math.random() * roles.length)];
        
        data.push({
            id: i + 1,
            hour: hour,
            minute: minute,
            time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
            role: role,
            type: Math.random() > 0.5 ? '进入' : '离开',
            gate: `${Math.floor(Math.random() * 5) + 1}号门`,
            temperature: (35 + Math.random() * 2).toFixed(1),
        });
    }
    
    return data;
}

// 生成大量出入记录数据（用于柱状图）
function generateRecordData(count) {
    const data = [];
    const methods = ['人脸识别', '门禁卡', '二维码', '访客登记', '指纹识别'];
    const roles = ['业主', '访客', '出租'];
    const buildings = ['A栋', 'B栋', 'C栋', 'D栋', 'E栋'];
    
    for (let i = 0; i < count; i++) {
        const hour = Math.floor(Math.random() * 24);
        const minute = Math.floor(Math.random() * 60);
        const method = methods[Math.floor(Math.random() * methods.length)];
        const role = roles[Math.floor(Math.random() * roles.length)];
        const building = buildings[Math.floor(Math.random() * buildings.length)];
        
        data.push({
            id: i + 1,
            method: method,
            role: role,
            building: building,
            time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
            type: Math.random() > 0.5 ? '进入' : '离开',
            duration: Math.floor(Math.random() * 3600), // 停留时长（秒）
            age: Math.floor(Math.random() * 60) + 18,
            gender: Math.random() > 0.5 ? '男' : '女',
        });
    }
    
    return data;
}

// 生成数据配置
const DATA_COUNT = 500000; // 50万条数据，可以根据需要调整

console.log(`开始生成 ${DATA_COUNT.toLocaleString()} 条数据...`);
console.time('生成时间');

// 生成时间数据
console.log('正在生成时间段数据...');
const timeData = generateTimeData(DATA_COUNT);
fs.writeFileSync(
    './public/largeTimeData.json',
    JSON.stringify(timeData),
    'utf8'
);
console.log(`✓ 时间段数据生成完成: ${DATA_COUNT.toLocaleString()} 条`);

// 生成记录数据
console.log('正在生成出入记录数据...');
const recordData = generateRecordData(DATA_COUNT);
fs.writeFileSync(
    './public/largeRecordData.json',
    JSON.stringify(recordData),
    'utf8'
);
console.log(`✓ 出入记录数据生成完成: ${DATA_COUNT.toLocaleString()} 条`);

console.timeEnd('生成时间');
console.log('\n数据生成完成！');
console.log(`文件位置:`);
console.log(`  - public/largeTimeData.json`);
console.log(`  - public/largeRecordData.json`);
console.log(`\n提示: 可以修改 DATA_COUNT 变量来生成更多或更少的数据`);
