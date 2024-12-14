function convertScaleToJapanese(scale) {
    const scaleMap = {
        10: '1',
        20: '2',
        30: '3',
        40: '4',
        45: '弱震',
        50: '弱震',
        55: '強震',
        60: '弱震',
        65: '強震',
        70: '震度7'
    };
    
    return scaleMap[scale] || '不明';
}

let latestEarthquakeData = null;

function fetchLatestEarthquake() {
    fetch('https://api.p2pquake.net/v2/jma/quake?limit=1', {
        method: 'GET'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('ネットワーク応答がOKではありません');
        }
        return response.json();
    })
    .then(data => {
        // データが存在するか確認
        if (data.length > 0 && data[0].earthquake) {
            latestEarthquakeData = data[0];
            const japaneseScale = convertScaleToJapanese(latestEarthquakeData.earthquake.maxScale || 0);
            document.getElementById('earthquake-details').innerHTML = `
                発生時刻: ${latestEarthquakeData.earthquake.time || '不明'}<br>
                震源地: ${latestEarthquakeData.earthquake.hypocenter?.name || '不明'}<br>
                マグニチュード: ${latestEarthquakeData.earthquake.hypocenter?.magnitude || '不明'}<br>
                最大震度: ${japaneseScale}
            `;
            // 津波情報の処理
            updateTsunamiInfo(latestEarthquakeData);
        } else {
            document.getElementById('earthquake-details').innerText = "地震情報はありません。";
            document.getElementById('tsunami-info').innerText = "津波情報もありません。";
        }
    })
    .catch(error => {
        console.error('データの取得に失敗:', error);
        document.getElementById('earthquake-details').innerText = "データの取得に失敗しました。";
        document.getElementById('tsunami-info').innerText = "津波情報の取得に失敗しました。";
    });
}

function updateTsunamiInfo(data) {
    if (data.earthquake.tsunami && data.earthquake.tsunami.length > 0) {
        const tsunami = data.earthquake.tsunami[0];
        document.getElementById('tsunami-info').innerHTML = `
            津波情報:<br>
            状態: ${tsunami.status || '不明'}<br>
            予想到達時刻: ${tsunami.expectedArrivalTime || '不明'}<br>
            予想高さ: ${tsunami.expectedHeight || '不明'}
        `;
    } else {
        document.getElementById('tsunami-info').innerText = "津波の心配はありません。";
    }
}

function postToX() {
    // earthquake-detailsとtsunami-infoの内容を取得
    const eqinfoElement = document.getElementById("earthquake-details");
    const eqinfo = eqinfoElement.innerText || eqinfoElement.textContent;
    const tsunamiInfoElement = document.getElementById("tsunami-info");
    const tsunamiInfo = tsunamiInfoElement.innerText || tsunamiInfoElement.textContent;

    // ツイート用のURLを生成
    const baseUrl = "https://x.com/intent/tweet";
    const tweetText = `${eqinfo}\n\n${tsunamiInfo}`; // eqinfoとtsunamiInfoをツイート内容に設定
    const hashtags = "地震,情報"; // ハッシュタグ

    const completeUrl = `${baseUrl}?text=${encodeURIComponent(tweetText)}&hashtags=${encodeURIComponent(hashtags)}`;

    // 生成されたURLをログに出力
    console.log(completeUrl);

    // ツイート画面を開く
    window.open(completeUrl, '_blank');
}

document.getElementById('x-post-btn').addEventListener('click', postToX);

// ページ読み込み時に一度情報を取得
fetchLatestEarthquake();

// 1分ごとに地震情報を更新
setInterval(fetchLatestEarthquake, 60000); // 60000ミリ秒 = 1分