const arrAvg = arr => arr.reduce((a,b) => a + b, 0) / arr.length;
fetch('/feedback/chat/:id').then(response => response.json());

let totalSentiment = response.TotalSentiment;
let sentimentOverTime = response.SentimentOverTime;
let messages;
let data;
let sentiments;

for (let message in response.Messages){
    messages.push([message.text, message.sentiment]);
}
sortedMessages = messages.sort(function(a, b){return a[1] - b[1]})
for (i = 0; i < 10; i++){
//output messages
}
for(let sent in response.SentimentOverTime){
    sentiments.push(sent.sentiment);
}
let average = arrAvg(sentiments);
data.push({"Last sent time", average})

let SentimentOverTime = new Chart(ctx, {
    type: 'line',
    options: {
        scales: {
            xAxes: [{
                type: 'time',
                distribution: 'linear'
            }]
        }
    },
    data: {
        labels: ["2015-03-15T13:03:00Z", "2015-03-25T13:02:00Z", "2015-04-25T14:12:00Z"],
        datasets: [{
            label: 'Demo',
            data: data,
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    }
});

