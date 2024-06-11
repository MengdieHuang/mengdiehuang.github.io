const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

let viewCount = 0;

// 读取文件中的初始浏览次数
fs.readFile('viewCount.txt', 'utf8', (err, data) => {
    if (!err) {
        viewCount = parseInt(data);
    }
});

app.get('/update-view-count', (req, res) => {
    viewCount += 1;

    // 将新的浏览次数写入文件
    fs.writeFile('viewCount.txt', viewCount.toString(), (err) => {
        if (err) {
            console.error('Failed to update view count:', err);
        }
    });

    res.json({ viewCount: viewCount });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
