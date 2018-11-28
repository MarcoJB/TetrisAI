function drawStats(stats, globalAvg, globalGen2Avg) {
    const statsCanvas = document.querySelector('#statsCanvas');
    const width = 600;
    const height = 500;
    statsCanvas.width = width;
    statsCanvas.height = height;
    const ctx = statsCanvas.getContext('2d');

    let lineWidth = width;
    if (stats.length > 0) lineWidth = statsCanvas.width / stats.length;

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < stats.length; i++) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(i * lineWidth, height - stats[i].averageScore * 4, lineWidth, 1);
        ctx.fillStyle = '#cc1111';
        ctx.fillRect(i * lineWidth, height - stats[i].averageTrained * 4, lineWidth, 1);
        ctx.fillStyle = '#229922';
        ctx.fillRect(i * lineWidth, height - stats[i].highScore, lineWidth, 1);
    }

    for (let i = 0; i < width; i++) {
        ctx.fillStyle = '#000000';
        if (i % 3 === 0) ctx.fillRect(i, height - globalAvg * 4, 1, 1);

        ctx.fillStyle = '#cc1111';
        if (i % 3 === 0) ctx.fillRect(i, height - globalGen2Avg * 4, 1, 1);
    }
}
